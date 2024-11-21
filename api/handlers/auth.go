package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/PoppedBit/HomeShareDrive/models"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

var DisallowedUsernames = []string{
	"login",
	"register",
	"logout",
	"settings",
}

// GenerateSalt creates a new salt for password hashing
func GenerateSalt() (string, error) {
	salt := make([]byte, 16)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(salt), nil
}

// HashPassword hashes a password with the given salt
func HashPassword(password, salt string) (string, error) {
	saltAndPassword := salt + password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(saltAndPassword), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// @Router /register [post]
// @Tags auth
// @Summary Register User
// @Description Register a new user
// @Accept json
// @Produce json
// @Param body body RegisterRequest true "Register Request"
// @Success 201 {string} string "User created"
func (h *Handler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the JSON request body
	var registerRequest RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&registerRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Access the identifier and password from the parsed object
	username := registerRequest.Username
	email := registerRequest.Email
	password := registerRequest.Password

	// Disallowed usernames,
	for _, disallowedUsername := range DisallowedUsernames {
		if username == disallowedUsername {
			http.Error(w, "Invalid username", http.StatusBadRequest)
			return
		}
	}

	// Ensure username is unique
	user := models.User{}
	h.DB.Where("username = ? or original_username = ?", username, username).First(&user)
	if user.ID != 0 {
		http.Error(w, "Username already taken", http.StatusBadRequest)
		return
	}

	// Ensure email is unique
	if len(email) != 0 {
		h.DB.Where("email = ?", email).First(&user)
		if user.ID != 0 {
			http.Error(w, "Email already taken", http.StatusBadRequest)
			return
		}
	}

	// TODO Validate Password

	// Hash the password
	salt, err := GenerateSalt()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	passwordHash, err := HashPassword(password, salt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If this is the first user, make them an admin
	var users []models.User
	h.DB.Find(&users)

	isAdmin := false
	if len(users) == 0 {
		isAdmin = true
	}

	// First two users are automatically verified
	isEmailVerified := false
	if len(users) < 2 {
		isEmailVerified = true
	}

	// Create the user
	user = models.User{
		Username:         username,
		OriginalUsername: username,
		Email:            email,
		IsEmailVerified:  isEmailVerified,
		PasswordHash:     passwordHash,
		PasswordSalt:     salt,
		IsAdmin:          isAdmin,
	}

	result := h.DB.Create(&user)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

type LoginRequest struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

// @Router /login [post]
// @Tags auth
// @Summary Login
// @Description Login
func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {

	// Parse the JSON request body
	var loginRequest LoginRequest
	err := json.NewDecoder(r.Body).Decode(&loginRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Access the identifier and password from the parsed object
	identifier := loginRequest.Identifier
	password := loginRequest.Password

	var user models.User
	result := h.DB.Where("username = ? OR original_username = ? OR email = ?", identifier, identifier, identifier).First(&user)
	if result.Error != nil {
		http.Error(w, "Invalid username or email", http.StatusBadRequest)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(user.PasswordSalt+password))
	if err != nil {
		http.Error(w, "Invalid username or email", http.StatusBadRequest)
		return
	}

	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	session.Values["id"] = user.ID

	err = session.Save(r, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO Update last login and last active

	w.WriteHeader(http.StatusOK)
}

type UserSession struct {
	ID        uint   `json:"id"`
	Username  string `json:"username"`
	IsAdmin   bool   `json:"isAdmin"`
	NameColor string `json:"nameColor"`
}

// @Router /check-session [get]
// @Tags auth
// @Summary Check Session
// @Produce json
// @Success 200
func (h *Handler) CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := session.Values["id"]

	userSession := UserSession{
		ID:        0,
		Username:  "",
		IsAdmin:   false,
		NameColor: "",
	}

	if userID != nil {
		var user models.User
		result := h.DB.First(&user, userID)

		// TODO - Invalidate session since user doesn't exist

		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		userSession.ID = userID.(uint)
		userSession.Username = user.Username
		userSession.IsAdmin = user.IsAdmin
		userSession.NameColor = user.NameColor
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userSession)
}

// @Router /logout [get]
// @Tags auth
// @Summary Logout
// @Description Logout
// @Success 200
func (h *Handler) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	session.Options.MaxAge = -1

	err = session.Save(r, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

type AccountSettings struct {
	Username         string `json:"username"`
	OriginalUsername string `json:"originalUsername"`
	Email            string `json:"email"`
	IsEmailVerified  bool   `json:"IsEmailVerified"`
	NameColor        string `json:"nameColor"`
	PFP              string `json:"pfp"`
}

func (h *Handler) AccountSettingsHandler(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := session.Values["id"]
	if userID == 0 {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}

	var user models.User
	result := h.DB.First(&user, userID)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	pfpFileName := ""

	pfp := models.Upload{}
	h.DB.Where("created_user_id = ? AND category = 'pfp'", user.ID).First(&pfp)
	if pfp.ID != 0 {
		pfpFileName = pfp.FileName
	}

	accountSettings := AccountSettings{
		Username:         user.Username,
		OriginalUsername: user.OriginalUsername,
		Email:            user.Email,
		IsEmailVerified:  user.IsEmailVerified,
		NameColor:        user.NameColor,
		PFP:              pfpFileName,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(accountSettings)
}

type UpdatePasswordRequest struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

func (h *Handler) UpdatePasswordHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the JSON request body
	var updatePasswordRequest UpdatePasswordRequest
	err := json.NewDecoder(r.Body).Decode(&updatePasswordRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Access the old and new password from the parsed object
	oldPassword := updatePasswordRequest.OldPassword
	newPassword := updatePasswordRequest.NewPassword

	// TODO make sure password meets requirements

	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := session.Values["id"]
	if userID == 0 {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}

	var user models.User
	result := h.DB.First(&user, userID)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(user.PasswordSalt+oldPassword))
	if err != nil {
		http.Error(w, "Invalid password", http.StatusBadRequest)
		return
	}

	salt, err := GenerateSalt()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	passwordHash, err := HashPassword(newPassword, salt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user.PasswordHash = passwordHash
	user.PasswordSalt = salt

	result = h.DB.Save(&user)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

type UpdateUsernameRequest struct {
	Username  string `json:"username"`
	NameColor string `json:"nameColor"`
}

func (h *Handler) UpdateUsernameHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the JSON request body
	var updateUsernameRequest UpdateUsernameRequest
	err := json.NewDecoder(r.Body).Decode(&updateUsernameRequest)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Access the username from the parsed object
	username := updateUsernameRequest.Username
	nameColor := updateUsernameRequest.NameColor

	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := session.Values["id"]
	if userID == nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}

	var user models.User
	result := h.DB.First(&user, userID)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Disallowed usernames,
	for _, disallowedUsername := range DisallowedUsernames {
		if username == disallowedUsername {
			http.Error(w, "Invalid username", http.StatusBadRequest)
			return
		}
	}

	// Ensure username is unique
	h.DB.Where("username = ? or original_username = ?", username, username).First(&user)
	if user.ID != 0 && user.ID != userID {
		http.Error(w, "Username already taken", http.StatusBadRequest)
		return
	}

	user.Username = username
	user.NameColor = nameColor

	result = h.DB.Save(&user)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) UpdateProfilePictureHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20) // 10 MB

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := session.Values["id"]
	if userID == nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}

	var user models.User
	result := h.DB.First(&user, userID)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	dstDir := filepath.Join(os.Getenv("UPLOAD_DIR"), "users", strconv.FormatUint(uint64(user.ID), 10))
	err = os.MkdirAll(dstDir, os.ModePerm)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fileName := handler.Filename
	extension := filepath.Ext(fileName)

	dstPath := filepath.Join(dstDir, "pfp."+extension)
	dst, err := os.Create(dstPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// TODO - Limit file size

	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete old upload entry
	var oldUpload models.Upload
	result = h.DB.Where("created_user_id = ? AND category = 'pfp'", user.ID).First(&oldUpload)
	if result.Error == nil {
		result = h.DB.Delete(&oldUpload)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
	}

	upload := models.Upload{
		CreatedUserID: user.ID,
		Category:      "pfp",
		FileName:      fileName,
		UploadPath:    dstPath,
	}

	result = h.DB.Create(&upload)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) GetProfilePictureHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	var userID uint

	// If no userID is provided, get the profile picture of the logged in user
	if _, ok := vars["userID"]; !ok {
		session, err := h.Store.Get(r, "session")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		userID = session.Values["id"].(uint)

		if userID == 0 {
			http.Error(w, "Not logged in", http.StatusUnauthorized)
			return
		}
	}

	if _, ok := vars["userID"]; ok {
		var err error
		userID64, err := strconv.ParseUint(vars["userID"], 10, 64)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		userID = uint(userID64)
	}

	if userID == 0 {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var upload models.Upload
	result := h.DB.Where("created_user_id = ? AND category = 'pfp'", userID).First(&upload)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	http.ServeFile(w, r, upload.UploadPath)
}

func (h *Handler) DeleteProfilePictureHandler(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := session.Values["id"]
	if userID == nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}

	var user models.User
	result := h.DB.First(&user, userID)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	var upload models.Upload
	result = h.DB.Where("created_user_id = ? AND category = 'pfp'", userID).First(&upload)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// If upload.UploadPath exists, delete it
	_, err = os.Stat(upload.UploadPath)
	if err == nil {
		err = os.Remove(upload.UploadPath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	result = h.DB.Delete(&upload)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
