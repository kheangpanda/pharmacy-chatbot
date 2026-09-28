.PHONY: up down build logs web api db

up:
	docker compose up

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

web:
	docker compose logs -f web

api:
	docker compose logs -f api

db:
	docker compose exec db psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-pharmacy_chatbot}

