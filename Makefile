.PHONY: help up down build logs restart clean ps dev-server dev-web install-server install-web init-ssl reload-nginx push login

help:
	@echo "Chartfolio Project - Docker Compose Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  up              Start all services"
	@echo "  down            Stop all services"
	@echo "  build           Build all Docker images"
	@echo "  logs            View logs from all services"
	@echo "  restart         Restart all services"
	@echo "  clean           Remove all containers, volumes, and images"
	@echo "  ps              Show status of all services"
	@echo ""
	@echo "SSL targets:"
	@echo "  init-ssl        Initialize SSL certificates (run once)"
	@echo "  reload-nginx    Reload nginx configuration"
	@echo ""
	@echo "Development targets:"
	@echo "  dev-server      Start backend in development mode (local)"
	@echo "  dev-web         Start frontend in development mode (local)"
	@echo "  install-server  Install backend dependencies"
	@echo "  install-web     Install frontend dependencies"
	@echo ""
	@echo "Deployment targets:"
	@echo "  push            Push Docker images to registry"
	@echo "  login           SSH to deployment server"

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose restart

clean:
	docker compose down -v --rmi all

ps:
	docker compose ps

init-ssl:
	./init-ssl.sh

reload-nginx:
	./reload-nginx.sh

dev-server:
	cd assets-server && npm run start:dev

dev-web:
	cd assets-web && npm run start

install-server:
	cd assets-server && npm install

install-web:
	cd assets-web && npm install

push:
	docker push harbor.ru.dmitriy.space/library/chartfolio-server:latest
	docker push harbor.ru.dmitriy.space/library/chartfolio-web:latest

login:
	ssh -p '37018' 'grig@dmitriy.space'
