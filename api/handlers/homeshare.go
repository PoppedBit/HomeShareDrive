package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/PoppedBit/HomeShareDrive/models"
)

var PathDelimiter = string(filepath.Separator)

type FileInfo struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Size    int64  `json:"size"`
	ModTime string `json:"modTime"`
	IsDir   bool   `json:"isDir"`
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

	homeShareRoot := os.Getenv("HOME_SHARE_ROOT")

	directory := homeShareRoot + path

	files, err := os.ReadDir(directory)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var fileInfos []FileInfo = make([]FileInfo, len(files))
	for index, file := range files {
		info, err := file.Info()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		fileName := file.Name()

		filePath := path
		if path != PathDelimiter {
			filePath += PathDelimiter
		}

		filePath += fileName

		fileInfo := FileInfo{
			Name:    fileName,
			Path:    filePath,
			Size:    info.Size(),
			ModTime: info.ModTime().String(),
			IsDir:   info.IsDir(),
		}

		fileInfos[index] = fileInfo
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

	directory := os.Getenv("HOME_SHARE_ROOT") + path

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

	directory := os.Getenv("HOME_SHARE_ROOT") + path

	err = os.RemoveAll(directory)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO: Image thumbnails

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

	oldPath := os.Getenv("HOME_SHARE_ROOT") + path

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

	filePath := os.Getenv("HOME_SHARE_ROOT") + path

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
// @Accept ???
// @Produce ???
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

	filePath := os.Getenv("HOME_SHARE_ROOT") + path + PathDelimiter + handler.Filename

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

	// TODO: Image thumbnails

	w.WriteHeader(http.StatusCreated)
}
