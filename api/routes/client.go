package routes

import (
	"github.com/PoppedBit/HomeShareDrive/handlers"
	"github.com/gorilla/mux"
)

func registerClientRoutes(r *mux.Router, handler *handlers.Handler) {
	r.HandleFunc("/client", handler.ClientHandler).Methods("GET")
}
