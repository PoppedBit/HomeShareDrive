package routes

import (
	"github.com/PoppedBit/HomeShareDrive/handlers"
	"github.com/gorilla/mux"
)

func registerAdminRoutes(r *mux.Router, handler *handlers.Handler) {
	r.HandleFunc("/admin/users", handler.GetUsersHandler).Methods("GET")
	r.HandleFunc("/admin/user/{userId}/ban", handler.BanUserHandler).Methods("POST")
	r.HandleFunc("/admin/user/{userId}/unban", handler.UnBanUserHandler).Methods("POST")

}
