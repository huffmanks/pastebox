### CONFIG ###
BUILDER := multi-arch-builder

### DEFAULT ###
all: dev

### HELP ###
help:
	@echo ""
	@echo "Commands:"
	@echo "  make dev                    - Run development workflow"
	@echo "  make prod                   - Full production build workflow"
	@echo "  make prod --push            - Build and push to Docker Hub"
	@echo "  make all                    - Alias for dev"
	@echo "  make help                   - Show this list"
	@echo ""

### DEVELOPMENT ###
dev:
	@echo "Running development server..."
	pnpm db:migrate:dev && pnpm dev

### PRODUCTION WORKFLOW ###
prod:
	@echo "Running production build..."
	@docker buildx ls | grep -q $(BUILDER) || docker buildx create --name $(BUILDER) --driver docker-container
	docker buildx inspect --bootstrap
	docker buildx use $(BUILDER)

	rm -rf data
	mkdir -p data
	pnpm db:push:prod

ifneq (,$(findstring --push,$(MAKECMDGOALS)))
	docker buildx build --platform linux/amd64,linux/arm64 -t huffmanks/pastebox:latest --push .
else
	docker buildx build -t huffmanks/pastebox:latest --load .
endif

	rm -rf data
	docker buildx rm $(BUILDER) || true
	@echo "Build complete."

.PHONY: help dev prod all```
