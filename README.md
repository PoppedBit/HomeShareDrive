# Home Share Drive

## Development

### Swagger

`go install github.com/swaggo/swag/cmd/swag@latest`

`swag init`

## Deployment Via Docker

### Configuration

docker-compose.yml

Dockerfile

.env.docker

### Build and Run

sudo docker-compose down --remove-orphans
sudo docker-compose up --build

### Debugging

sudo docker-compose up --no-start
sudo docker start homeshare
sudo docker exec -it homeshare








