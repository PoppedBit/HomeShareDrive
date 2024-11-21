# Step 1: Use an official Node.js image to build the React app
FROM node:18 AS react-build

# Set the working directory for the React build
WORKDIR /client

# Copy React app package.json and lock files
COPY client/package.json client/package-lock.json ./

# Install dependencies for the React app
RUN npm install

# Copy the entire React app's source code
COPY client ./

# Build the React app for production
RUN npm run build:production:docker

# Step 2: Use an official Golang image to build the Go application
FROM golang:1.23 AS go-build

# Set the working directory for the Go build
WORKDIR /app

# Copy Go mod and sum files, then download dependencies
COPY api/go.mod api/go.sum ./
RUN go mod download

# Copy the rest of the Go application's code
COPY api/ .

# Build the Go application
RUN go build -o homeshare .


# Step 3: Use a minimal base image for the final stage
FROM ubuntu:22.04

# Set the working directory for the runtime environment
WORKDIR /

# Copy the Go binary from the build stage
COPY --from=go-build /app/homeshare .

# Copy the .env file
COPY api/.env.docker .env

# Copy the React build output from the React build stage
COPY --from=react-build /client/dist /public

# Expose the application’s port
EXPOSE 8080

# Define the command to run the application
CMD ["./homeshare"]
