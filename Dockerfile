# Use an official Golang image as the build environment
FROM golang:1.23 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files, then download dependencies
COPY api/go.mod api/go.sum ./
RUN go mod download

# Copy the rest of the application's code
COPY api/ .

# Build the Go application
RUN go build -o homeshare .

# Use a minimal base image for the final stage to reduce size
FROM ubuntu:22.04

# Set the working directory for the runtime environment
WORKDIR /

# Copy the Go binary from the build stage
COPY --from=build /app/homeshare .

# Copy the .env file from the build stage
COPY api/.env.docker .env

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# TODO - build the react app

# Copy the pre-built React app's public directory
COPY api/public /public

# Expose the application’s port (adjust if not 8080)
EXPOSE 8080

# Define the command to run the application
CMD ["./homeshare"]
