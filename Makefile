# Koda — local development.
#
#   make dev-local       the whole stack in Docker: app + Mongo
#   make dev-local-api   …and the FastAPI service, once server/ exists
#   make down            stop it
#
# Run it beside a host `npm run dev` by moving the port:
#   APP_PORT=3002 make dev-local

COMPOSE ?= docker compose
APP_PORT ?= 3001
export APP_PORT

.DEFAULT_GOAL := help

## help: list the targets
help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## //' | awk -F': ' '{printf "  \033[1m%-16s\033[0m %s\n", $$1, $$2}'

## dev-local: build and run the app and Mongo in Docker
dev-local:
	$(COMPOSE) up --build -d app
	@echo
	@echo "  Koda        http://localhost:$(APP_PORT)"
	@echo "  Mongo       mongodb://localhost:$${MONGO_PORT:-27017}"
	@echo "  Logs        make logs"
	@echo

## dev-local-api: the same, plus the FastAPI service
dev-local-api:
	$(COMPOSE) --profile api up --build -d
	@echo
	@echo "  Koda        http://localhost:$(APP_PORT)"
	@echo "  API         http://localhost:$${API_PORT:-8000}/v1/health"
	@echo

## prod-local: build the production image and serve the built app
prod-local:
	$(COMPOSE) -f docker-compose.yml run --rm --build --service-ports \
		-e NODE_ENV=production app node dist/server.cjs

## logs: follow the app's output
logs:
	$(COMPOSE) logs -f app

## ps: what is running
ps:
	$(COMPOSE) ps

## shell: a shell inside the app container
shell:
	$(COMPOSE) exec app sh

## mongo-shell: a mongosh session against the local database
mongo-shell:
	$(COMPOSE) exec mongo mongosh koda

## down: stop the stack, keep the database
down:
	$(COMPOSE) --profile api down

## clean: stop the stack and delete the database volume
clean:
	$(COMPOSE) --profile api down -v

.PHONY: help dev-local dev-local-api prod-local logs ps shell mongo-shell down clean
