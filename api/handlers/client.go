package handlers

import "net/http"

func (h *Handler) ClientHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "public/index.html")
}
