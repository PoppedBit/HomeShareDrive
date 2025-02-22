package handlers

import (
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/PoppedBit/HomeShareDrive/models"
	"golang.org/x/image/draw"
)

func homeShareRoot() string {
	return os.Getenv("HOME_SHARE_ROOT")
}

var PathDelimiter = string(filepath.Separator)
var IsWindows = PathDelimiter == "\\"

func processPath(path string) string {
	if IsWindows {
		return strings.ReplaceAll(path, "/", "\\")
	}
	return path
}

// Function that ensures the path is within the root directory
func checkPathInRoot(path string) bool {
	if strings.Contains(path, "..") {
		return false
	}

	return strings.HasPrefix(path, homeShareRoot())
}

var imageExtensions = []string{".jpg", ".jpeg", ".png"}
var thumbWidth = 300

type FileInfo struct {
	Name          string `json:"name"`
	Path          string `json:"path"`
	ThumbnailPath string `json:"thumbnailPath"`
	Size          int64  `json:"size"`
	ModTime       string `json:"modTime"`
	IsDir         bool   `json:"isDir"`
}

// only verified users can homeshare
func CheckCanHomeshare(h *Handler, r *http.Request) bool {
	session, err := h.Store.Get(r, "session")
	if err != nil {
		return false
	}

	userID := session.Values["id"]
	if userID == nil {
		return false
	}

	var user models.User
	result := h.DB.First(&user, userID)
	if result.Error != nil {
		return false
	}

	return user.IsEmailVerified || user.IsAdmin
}

type GetDirectoryContentsResponse struct {
	Path  string     `json:"path"`
	Items []FileInfo `json:"items"`
}

// @Router /directory-contents [get]
// @Tags homeshare
// @Summary Directory Contents
// @Description Get contents of a directory
// @Accept json
// @Produce json
// @Param path query string true "Path"
// @Success 200 {object} GetDirectoryContentsResponse "Directory Contents"
func (h *Handler) DirectoryContentsHandler(w http.ResponseWriter, r *http.Request) {
	isAuthorized := CheckCanHomeshare(h, r)
	if !isAuthorized {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	path := r.URL.Query().Get("path")

	directory := processPath(homeShareRoot() + path)

	if !checkPathInRoot(directory) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	files, err := os.ReadDir(directory)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fileInfos := []FileInfo{}
	for _, file := range files {
		info, err := file.Info()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		fileName := file.Name()

		// skip anything that starts with a dot
		if strings.HasPrefix(fileName, ".") {
			continue
		}

		filePath := path
		if path != PathDelimiter {
			filePath += PathDelimiter
		}

		filePath += fileName

		// Return thumbnail path if it exists
		thumbnailPath := ""
		if !info.IsDir() {
			thumbnailPath = path + PathDelimiter + ".thumbnails" + PathDelimiter + fileName
			thumbnailFullPath := homeShareRoot() + thumbnailPath
			if _, err := os.Stat(thumbnailFullPath); os.IsNotExist(err) {
				thumbnailPath = ""
			}
		}

		fileInfo := FileInfo{
			Name:          fileName,
			Path:          filePath,
			ThumbnailPath: thumbnailPath,
			Size:          info.Size(),
			ModTime:       info.ModTime().String(),
			IsDir:         info.IsDir(),
		}

		fileInfos = append(fileInfos, fileInfo)
	}

	// Order by directories first, then files
	if len(fileInfos) > 1 {
		for i := 0; i < len(fileInfos); i++ {
			for j := i + 1; j < len(fileInfos); j++ {
				if !fileInfos[i].IsDir && fileInfos[j].IsDir {
					fileInfos[i], fileInfos[j] = fileInfos[j], fileInfos[i]
				}
			}
		}
	}

	response := GetDirectoryContentsResponse{
		Path:  path,
		Items: fileInfos,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type CreateDirectoryRequest struct {
	Path string `json:"path"`
	Name string `json:"name"`
}

type CreateDirectoryResponse struct {
	Path      string   `json:"path"`
	Directory FileInfo `json:"directory"`
}

// @Router /create-directory [post]
// @Tags homeshare
// @Summary Create Directory
// @Description Create a new directory
// @Accept json
// @Produce json
// @Param body body CreateDirectoryRequest true "Body"
// @Success 200 {object} CreateDirectoryResponse "New Directory"
func (h *Handler) CreateDirectoryHandler(w http.ResponseWriter, r *http.Request) {
	isAuthorized := CheckCanHomeshare(h, r)
	if !isAuthorized {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var createDirectoryRequest CreateDirectoryRequest
	err := json.NewDecoder(r.Body).Decode(&createDirectoryRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Access the username from the parsed object
	path := createDirectoryRequest.Path
	name := createDirectoryRequest.Name

	directory := processPath(homeShareRoot() + path)

	if !checkPathInRoot(directory) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	newDirectory := directory + PathDelimiter + name

	err = os.Mkdir(newDirectory, 0755)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return FileInfo of new directory
	info, err := os.Stat(newDirectory)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fileInfo := FileInfo{
		Name:    info.Name(),
		Size:    info.Size(),
		ModTime: info.ModTime().String(),
		IsDir:   info.IsDir(),
	}

	response := CreateDirectoryResponse{
		Path:      path,
		Directory: fileInfo,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type DeleteItemRequest struct {
	Path string `json:"path"`
}

type DeleteItemResponse struct {
	Path string `json:"path"`
}

// @Router /delete-item [delete]
// @Tags homeshare
// @Summary Delete Item
// @Description Delete a directory or file
// @Accept json
// @Produce json
// @Param body body DeleteItemRequest true "Body"
// @Success 200 {object} DeleteItemResponse "Deleted Item"
func (h *Handler) DeleteItemHandler(w http.ResponseWriter, r *http.Request) {
	isAuthorized := CheckCanHomeshare(h, r)
	if !isAuthorized {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var deleteItemRequest DeleteItemRequest
	err := json.NewDecoder(r.Body).Decode(&deleteItemRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	path := deleteItemRequest.Path

	itemPath := processPath(homeShareRoot() + path)

	if !checkPathInRoot(itemPath) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	info, err := os.Stat(itemPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete thumbnail if it exists
	if !info.IsDir() {
		fileDir := filepath.Dir(itemPath)
		fileName := filepath.Base(itemPath)
		thumbnailPath := fileDir + PathDelimiter + ".thumbnails" + PathDelimiter + fileName

		if _, err := os.Stat(thumbnailPath); err == nil {
			err = os.Remove(thumbnailPath)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	err = os.RemoveAll(itemPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := DeleteItemResponse{
		Path: path,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type RenameItemRequest struct {
	Path string `json:"path"`
	Name string `json:"name"`
}

type RenameItemResponse struct {
	Path string `json:"path"`
	Name string `json:"name"`
}

// @Router /rename-item [post]
// @Tags homeshare
// @Summary Rename Item
// @Description Rename a directory or file
// @Accept json
// @Produce json
// @Param body body RenameItemRequest true "Body"
// @Success 200 {object} RenameItemResponse "Renamed Item"
func (h *Handler) RenameItemHandler(w http.ResponseWriter, r *http.Request) {
	isAuthorized := CheckCanHomeshare(h, r)
	if !isAuthorized {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var renameItemRequest RenameItemRequest
	err := json.NewDecoder(r.Body).Decode(&renameItemRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	path := renameItemRequest.Path
	newName := renameItemRequest.Name

	oldPath := processPath(homeShareRoot() + path)

	if !checkPathInRoot(oldPath) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	directory := oldPath[:len(oldPath)-len(oldPath[strings.LastIndex(oldPath, PathDelimiter):])]
	newPath := directory + PathDelimiter + newName

	err = os.Rename(oldPath, newPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO: Image thumbnails

	response := RenameItemResponse{
		Path: path,
		Name: newName,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// @Router /download-file [get]
// @Tags homeshare
// @Summary Download File
// @Description Download a file
// @Accept json
// @Produce json
// @Param path query string true "Path"
func (h *Handler) DownloadFileHandler(w http.ResponseWriter, r *http.Request) {
	isAuthorized := CheckCanHomeshare(h, r)
	if !isAuthorized {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	path := r.URL.Query().Get("path")

	filePath := processPath(homeShareRoot() + path)

	if !checkPathInRoot(filePath) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	_, err := os.Stat(filePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.ServeFile(w, r, filePath)
}

// @Router /upload-file [post]
// @Tags homeshare
// @Summary Upload File
// @Description Upload a file
// @Accept json
// @Produce json
func (h *Handler) UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	isAuthorized := CheckCanHomeshare(h, r)
	if !isAuthorized {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	path := r.URL.Query().Get("path")

	// Request has formdata
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	filePath := processPath(homeShareRoot() + path + PathDelimiter + handler.Filename)

	if !checkPathInRoot(filePath) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	newFile, err := os.Create(filePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer newFile.Close()

	_, err = io.Copy(newFile, file)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Linux permissions
	if runtime.GOOS != "windows" {
		err := os.Chmod(filePath, 0o775)
		if err != nil {
			http.Error(w, "Error setting file permissions", http.StatusInternalServerError)
			return
		}
	}

	// Thumbnails
	extension := filepath.Ext(filePath)
	extension = strings.ToLower(extension)

	isImage := false
	for _, imageExtension := range imageExtensions {
		if extension == imageExtension {
			isImage = true
			break
		}
	}

	if isImage {
		err = generateThumbnail(filePath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
}

func generateThumbnail(filePath string) error {

	// Thumbnail Path = {fileDir}/.thumbnails/{fileName}
	fileDir := filepath.Dir(filePath)
	thumbDir := fileDir + PathDelimiter + ".thumbnails"
	thumbnailPath := thumbDir + PathDelimiter + filepath.Base(filePath)

	// if thumbnail already exists, skip
	if _, err := os.Stat(thumbnailPath); err == nil {
		return nil
	}

	println("Generating thumbnail for " + filePath)

	imageFile, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer imageFile.Close()

	srcImage, _, err := image.Decode(imageFile)
	if err != nil {
		return err
	}

	srcBounds := srcImage.Bounds()
	srcWidth := srcBounds.Dx()
	srcHeight := srcBounds.Dy()

	var newWidth, newHeight int

	if srcWidth > thumbWidth {
		newWidth = thumbWidth
		newHeight = srcHeight * thumbWidth / srcWidth
	} else {
		newWidth = srcWidth
		newHeight = srcHeight
	}

	thumbnail := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))

	draw.ApproxBiLinear.Scale(thumbnail, thumbnail.Rect, srcImage, srcImage.Bounds(), draw.Over, nil)

	err = os.MkdirAll(thumbDir, 0755)
	if err != nil {
		return err
	}

	thumbFile, err := os.Create(thumbnailPath)
	if err != nil {
		return err
	}
	defer thumbFile.Close()

	ext := filepath.Ext(filePath)
	ext = strings.ToLower(ext)

	if ext == ".jpg" || ext == ".jpeg" {
		err = jpeg.Encode(thumbFile, thumbnail, nil)
	} else if ext == ".png" {
		err = png.Encode(thumbFile, thumbnail)
	}

	if err != nil {
		return err
	}

	return nil
}

// @Router /ensure-thumbnails [get]
// @Tags homeshare
// @Summary Ensure Thumbnails
// @Description Travserses homeshare, generating thumbnails for images
// @Accept json
// @Produce json
func (h *Handler) EnsureThumbnailsHandler(w http.ResponseWriter, r *http.Request) {
	isAuthorized := CheckCanHomeshare(h, r)
	if !isAuthorized {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	count := createDirectoryThumbnails(homeShareRoot())

	fmt.Sprintf("Generated %d thumbnails", count)

	w.WriteHeader(http.StatusOK)
}

func createDirectoryThumbnails(directory string) int {
	files, err := os.ReadDir(directory)
	if err != nil {
		return 0
	}

	count := 0
	for _, file := range files {
		info, err := file.Info()
		if err != nil {
			continue
		}

		if info.IsDir() && !strings.HasPrefix(info.Name(), ".") {
			count += createDirectoryThumbnails(directory + PathDelimiter + info.Name())
		} else {
			ext := filepath.Ext(info.Name())
			ext = strings.ToLower(ext)

			isImage := false
			for _, imageExtension := range imageExtensions {
				if ext == imageExtension {
					isImage = true
					break
				}
			}

			if isImage {
				filePath := directory + PathDelimiter + info.Name()
				err = generateThumbnail(filePath)
				if err == nil {
					count++
				}
			}
		}
	}

	return count
}
