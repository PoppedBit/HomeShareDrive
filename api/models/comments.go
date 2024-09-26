package models

import "gorm.io/gorm"

type Comment struct {
	gorm.Model
	ID       uint     `gorm:"primaryKey;autoIncrement"`
	AuthorID uint     `gorm:"not null"`
	Author   User     `gorm:"foreignKey:AuthorID"`
	PostID   uint     `gorm:"not null"`
	Post     Post     `gorm:"foreignKey:PostID"`
	ParentID uint     `gorm:"default:null"`
	Parent   *Comment `gorm:"foreignKey:ParentID"`
	Body     string
	NetVotes int
}
