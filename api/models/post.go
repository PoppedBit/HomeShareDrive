package models

import "gorm.io/gorm"

type Post struct {
	gorm.Model
	ID           uint `gorm:"primaryKey;autoIncrement"`
	AuthorID     uint `gorm:"not null"`
	Author       User `gorm:"foreignKey:AuthorID"`
	Title        string
	Url          string
	Body         string
	IsPublished  bool
	NetVotes     int
	CommentCount int
	IsNSFW       bool
}
