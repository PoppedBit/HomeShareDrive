package routes

import (
	"net/http"

	"github.com/PoppedBit/HomeShareDrive/handlers"
	"github.com/gorilla/mux"
)

func RegisterRoutes(r *mux.Router, handler *handlers.Handler) {
	registerAdminRoutes(r, handler)
	registerAuthRoutes(r, handler)
	registerClientRoutes(r, handler)
	registerHomeShareRoutes(r, handler)

	r.PathPrefix("/app").Handler(http.StripPrefix("/app", http.FileServer(http.Dir("public"))))
}
