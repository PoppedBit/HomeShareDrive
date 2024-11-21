# Home Share Drive

## Deployment Via Docker

### Configuration

#### docker-compose.yml

Under `volumes`, modify the left side to be the absolute path to where the root of the homeshare will be:

`/absolute/path/on/real/filesystem:/mnt/homeshare`

### Build and Run

sudo docker-compose down --remove-orphans
sudo docker-compose up --build

### Network Accessibility

#### Linux

Allow traffic through firewall

`sudo ufw allow 8080`

Get IP Address

`hostname -I`

#### Windows

`TODO`

### Debugging

sudo docker-compose up --no-start
sudo docker start homeshare
sudo docker exec -it homeshare

## Use

The first account you register will be an admin

The seconf account will not be an admin, but will have their email verified(so you don't have to do this)

Additional users can register, but to use the site, you nned to mark their email as verified

## Development

### Swagger

`go install github.com/swaggo/swag/cmd/swag@latest`

`swag init`







