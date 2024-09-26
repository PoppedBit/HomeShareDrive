package routes

import (
	"github.com/PoppedBit/HomeShareDrive/handlers"
	"github.com/gorilla/mux"
)

func registerHomeShareRoutes(r *mux.Router, handler *handlers.Handler) {
	r.HandleFunc("/directory-contents", handler.DirectoryContentsHandler).Methods("GET")
}
