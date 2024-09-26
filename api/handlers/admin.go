package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/PoppedBit/HomeShareDrive/models"
	"github.com/gorilla/mux"
)

func CheckIsAdmin(h *Handler, r *http.Request) bool {
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

	return user.IsAdmin
}

type GetUsersResponse struct {
	Users []models.User `json:"users"`
}

// @Router /admin/users [get]
// @Tags admin
// @Summary Get Users
// @Description Get All Users
// @Produce json
// @Success 200
func (h *Handler) GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	userID := session.Values["id"]
	if userID == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user is admin
	var user models.User
	result := h.DB.First(&user, userID)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if !user.IsAdmin {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var users []models.User
	result = h.DB.Find(&users)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	response := GetUsersResponse{
		Users: users,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type BanUserRequest struct {
	Reason    string     `json:"reason"`
	UnBanDate *time.Time `json:"banDuration"`
}

func (h *Handler) BanUserHandler(w http.ResponseWriter, r *http.Request) {
	isAdmin := CheckIsAdmin(h, r)
	if !isAdmin {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	userId := vars["userId"]

	var banRequest BanUserRequest
	err := json.NewDecoder(r.Body).Decode(&banRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var targetUser models.User
	result := h.DB.First(&targetUser, userId)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if targetUser.IsBanned || targetUser.IsAdmin {
		http.Error(w, "You cannot ban this user.", http.StatusBadRequest)
		return
	}

	targetUser.IsBanned = true
	targetUser.BanReason = banRequest.Reason
	targetUser.UnBanDate = banRequest.UnBanDate
	if targetUser.UnBanDate == nil {
		// default to 1000 years
		unbanDate := time.Now().AddDate(1000, 0, 0)
		targetUser.UnBanDate = &unbanDate
	}

	result = h.DB.Save(&targetUser)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(targetUser)
}

func (h *Handler) UnBanUserHandler(w http.ResponseWriter, r *http.Request) {
	isAdmin := CheckIsAdmin(h, r)
	if !isAdmin {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	userId := vars["userId"]

	var banRequest BanUserRequest
	err := json.NewDecoder(r.Body).Decode(&banRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var targetUser models.User
	result := h.DB.First(&targetUser, userId)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if !targetUser.IsBanned {
		http.Error(w, "You cannot unban this user.", http.StatusBadRequest)
		return
	}

	targetUser.IsBanned = false
	targetUser.BanReason = ""
	targetUser.UnBanDate = nil

	result = h.DB.Save(&targetUser)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(targetUser)
}
