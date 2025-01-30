package routes

import (
	"github.com/PoppedBit/HomeShareDrive/handlers"
	"github.com/gorilla/mux"
)

func registerHomeShareRoutes(r *mux.Router, handler *handlers.Handler) {
	r.HandleFunc("/directory-contents", handler.DirectoryContentsHandler).Methods("GET")
	r.HandleFunc("/create-directory", handler.CreateDirectoryHandler).Methods("POST")
	r.HandleFunc("/delete-item", handler.DeleteItemHandler).Methods("DELETE")
	r.HandleFunc("/rename-item", handler.RenameItemHandler).Methods("POST")
	r.HandleFunc("/download-file", handler.DownloadFileHandler).Methods("GET")
	r.HandleFunc("/upload-file", handler.UploadFileHandler).Methods("POST")
	r.HandleFunc("/ensure-thumbnails", handler.EnsureThumbnailsHandler).Methods("GET")
	// TODO - Clean up thumbnails
	// TODO - Move
	// TODO - Copy
	// TODO - download directory
}
