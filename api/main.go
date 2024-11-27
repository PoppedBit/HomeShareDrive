package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"

	_ "github.com/PoppedBit/HomeShareDrive/docs" // This imports the generated swagger docs

	"github.com/PoppedBit/HomeShareDrive/handlers"
	"github.com/PoppedBit/HomeShareDrive/models"
	"github.com/PoppedBit/HomeShareDrive/routes"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	httpSwagger "github.com/swaggo/http-swagger"
)

func main() {

	// env
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	// Session
	cookieSecret := os.Getenv("COOKIE_SECRET")
	cookieStore := sessions.NewCookieStore([]byte(cookieSecret))
	cookieStore.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   7 * 24 * 60 * 60, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // Adjust as needed
	}

	// Database
	db := models.InitializeDB()
	models.Migrate(db)

	// Handler
	handler := &handlers.Handler{
		DB:    db,
		Store: cookieStore,
	}

	// Router
	router := mux.NewRouter()
	routes.RegisterRoutes(router, handler)
	http.Handle("/", router)

	// Swagger
	router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	// Server
	port := os.Getenv("PORT")
	localIP := getLocalIP()

	fmt.Print("\033[H\033[2J") // Clear terminal
	println("Server running at http://localhost:" + port + "/app")
	println("Network: http://" + localIP + ":" + port + "/app")
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func getLocalIP() string {
	// Loop through the system's network interfaces
	interfaces, err := net.Interfaces()
	if err != nil {
		fmt.Println("Error getting network interfaces:", err)
		os.Exit(1)
	}

	for _, iface := range interfaces {
		// Skip loopback interfaces and those that are down
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}

		// Get all unicast addresses for the interface
		addrs, err := iface.Addrs()
		if err != nil {
			fmt.Println("Error getting addresses for interface:", err)
			continue
		}

		for _, addr := range addrs {
			// Check for valid IPv4 address
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}

			if ip == nil || ip.IsLoopback() {
				continue
			}

			// Return the first non-loopback IPv4 address found
			ip = ip.To4()
			if ip != nil {
				return ip.String()
			}
		}
	}

	return "localhost" // Fallback if no external IP is found
}
