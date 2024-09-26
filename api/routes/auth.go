package routes

import (
	"github.com/PoppedBit/HomeShareDrive/handlers"
	"github.com/gorilla/mux"
)

func registerAuthRoutes(r *mux.Router, handler *handlers.Handler) {
	r.HandleFunc("/register", handler.RegisterHandler).Methods("POST")
	r.HandleFunc("/login", handler.LoginHandler).Methods("POST")
	r.HandleFunc("/check-session", handler.CheckSessionHandler).Methods("GET")
	r.HandleFunc("/logout", handler.LogoutHandler).Methods("GET")

	r.HandleFunc("/account", handler.AccountSettingsHandler).Methods("GET")
	r.HandleFunc("/account/username", handler.UpdateUsernameHandler).Methods("POST")
	r.HandleFunc("/account/pfp", handler.UpdateProfilePictureHandler).Methods("POST")
	r.HandleFunc("/account/password", handler.UpdatePasswordHandler).Methods("POST")
	r.HandleFunc("/account/pfp", handler.GetProfilePictureHandler).Methods("GET")
	r.HandleFunc("/account/pfp/{userID}", handler.GetProfilePictureHandler).Methods("GET")
	r.HandleFunc("/account/pfp", handler.DeleteProfilePictureHandler).Methods("DELETE")
}
