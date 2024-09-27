package handlers

import (
	"encoding/json"
	"net/http"
	"os"
)

type FileInfo struct {
	Name    string `json:"name"`
	Size    int64  `json:"size"`
	ModTime string `json:"modTime"`
	IsDir   bool   `json:"isDir"`
}

type GetDirectoryContentsRequest struct {
	Path string `json:"path"`
}

type GetDirectoryContentsResponse struct {
	Path  string     `json:"path"`
	Items []FileInfo `json:"items"`
}

// @Router /directory-contents [post]
// @Tags homeshare
// @Summary Directory Contents
// @Description Get contents of a directory
// @Accept json
// @Produce json
// @Param body body GetDirectoryContentsRequest true "Body"
// @Success 200 {object} GetDirectoryContentsResponse "Directory Contents"
func (h *Handler) DirectoryContentsHandler(w http.ResponseWriter, r *http.Request) {

	var directoryContentsRequest GetDirectoryContentsRequest
	err := json.NewDecoder(r.Body).Decode(&directoryContentsRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Access the username from the parsed object
	path := directoryContentsRequest.Path

	homeShareRoot := os.Getenv("HOME_SHARE_ROOT")

	directory := homeShareRoot + path

	files, err := os.ReadDir(directory)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var fileInfos []FileInfo
	for _, file := range files {
		info, err := file.Info()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		fileInfo := FileInfo{
			Name:    file.Name(),
			Size:    info.Size(),
			ModTime: info.ModTime().String(),
			IsDir:   info.IsDir(),
		}

		fileInfos = append(fileInfos, fileInfo)
	}

	// Order by directories first, then files
	for i := 0; i < len(fileInfos); i++ {
		for j := i + 1; j < len(fileInfos); j++ {
			if !fileInfos[i].IsDir && fileInfos[j].IsDir {
				fileInfos[i], fileInfos[j] = fileInfos[j], fileInfos[i]
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

	newDirectory := directory + "/" + name

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

type DeleteDirectoryRequest struct {
	Path string `json:"path"`
}

type DeleteDirectoryResponse struct {
	Path string `json:"path"`
}

// @Router /delete-directory [delete]
// @Tags homeshare
// @Summary Delete Directory
// @Description Delete a directory
// @Accept json
// @Produce json
// @Param body body DeleteDirectoryRequest true "Body"
// @Success 200 {object} DeleteDirectoryResponse "Deleted Directory"
func (h *Handler) DeleteDirectoryHandler(w http.ResponseWriter, r *http.Request) {

	var deleteDirectoryRequest DeleteDirectoryRequest
	err := json.NewDecoder(r.Body).Decode(&deleteDirectoryRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	path := deleteDirectoryRequest.Path

	directory := os.Getenv("HOME_SHARE_ROOT") + path

	err = os.RemoveAll(directory)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := DeleteDirectoryResponse{
		Path: path,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
