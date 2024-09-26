package handlers

import (
	"github.com/gorilla/sessions"
	"gorm.io/gorm"
)

type Handler struct {
	DB    *gorm.DB
	Store *sessions.CookieStore
}
