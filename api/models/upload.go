package models

import (
	"gorm.io/gorm"
)

type Upload struct {
	gorm.Model
	ID            uint `gorm:"primaryKey;autoIncrement"`
	CreatedUserID uint `gorm:"not null;constraint:OnDelete:CASCADE"`
	User          User `gorm:"foreignKey:CreatedUserID"`
	Category      string
	FileName      string
	UploadPath    string
}
