package models

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func InitializeDB() *gorm.DB {
	connectionString := os.Getenv("DB_CONNECTION_STRING")

	var db *gorm.DB
	var err error

	// Attempt to connect up to 5 times with a 5-second delay between attempts
	for i := 0; i < 5; i++ {
		db, err = gorm.Open(mysql.Open(connectionString), &gorm.Config{})
		if err == nil {
			// Connection was successful, return the DB instance
			return db
		}

		log.Printf("Attempt %d: failed to connect to the database: %v", i+1, err)
		time.Sleep(5 * time.Second)
	}

	// If it fails after all attempts, log fatal error and exit
	log.Fatalf("failed to connect to the database after retries: %v", err)
	return nil
}

func Migrate(db *gorm.DB) {
	db.AutoMigrate(&User{})
	db.AutoMigrate(&Upload{})
}
