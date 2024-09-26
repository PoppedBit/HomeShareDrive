package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID               uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	Username         string     `json:"username"`
	OriginalUsername string     `json:"originalUsername"`
	Email            string     `json:"email"`
	IsEmailVerified  bool       `json:"isEmailVerified"`
	PasswordHash     string     `gorm:"type:varchar(255);not null" json:"-"`
	PasswordSalt     string     `gorm:"type:varchar(255);not null" json:"-"`
	LastLoginDate    *time.Time `json:"lastLoginDate"`
	LastActiveDate   *time.Time `json:"lastActiveDate"`

	// Roles
	IsAdmin bool `json:"isAdmin"`

	// Ban
	IsBanned  bool       `json:"isBanned"`
	UnBanDate *time.Time `json:"unBanDate"`
	BanReason string     `json:"banReason"`

	// Personalization
	NameColor string `gorm:"type:varchar(7);default:#FF69B4" json:"nameColor"`

	// GORM default properties
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt"`
}
