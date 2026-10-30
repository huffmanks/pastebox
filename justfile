BUILDER := "pastebox-builder"
IMAGE_NAME := "huffmanks/pastebox"
VERSION := `node -p "require('./package.json').version"`

# --- Public Recipes ---

default:
    @just --list

# Initialize environment files
init:
    @for env in development staging production; do \
        if [ ! -f .env.$env ]; then \
            cp .example.env.$env .env.$env; \
            echo "Created .env.$env"; \
        else \
            echo ".env.$env already exists, skipping..."; \
        fi; \
    done

# Run development workflow
dev:
    @test -f .env.development || (echo "Error: .env.development missing! Run 'just init' first." && exit 1)
    @echo "Starting development environment..."
    @just -E .env.development db migrate
    @set -a; source .env.development; set +a; pnpm dev

# Run database command (e.g., just db migrate production)
db action profile="development":
    @test -f .env.{{profile}} || (echo "Error: .env.{{profile}} missing!" && exit 1)
    @echo "Running database {{action}} for {{profile}}..."
    @set -a; source .env.{{profile}}; set +a; pnpm drizzle-kit {{action}}{{ if profile == "production" { if action == "push" { " --force" } else { "" } } else { "" } }}

# Build the Docker image
build push="false":
    @test -f .env.production || (echo "Error: .env.production missing!" && exit 1)
    @echo "Building Pastebox version {{VERSION}}..."
    @docker buildx ls | grep -q {{BUILDER}} || docker buildx create --name {{BUILDER}} --driver docker-container
    docker buildx inspect --bootstrap
    docker buildx use {{BUILDER}}

    @echo "Preparing production database..."
    @just -E .env.production db push production

    {{ if push == "true" { \
        "docker buildx build --platform linux/amd64,linux/arm64 " + \
        "-t " + IMAGE_NAME + ":" + VERSION + " " + \
        "-t " + IMAGE_NAME + ":latest --push ." \
    } else { \
        "docker buildx build -t " + IMAGE_NAME + ":local --load ." \
    } }}

    @docker buildx rm {{BUILDER}} || true
    @echo "Build complete."

# Start environment (e.g., just up production)
up profile="staging":
    @test -f .env.{{profile}} || (echo "Error: .env.{{profile}} missing! Run 'just init' first." && exit 1)
    @echo "Starting {{profile}} environment..."
    @if [ "{{profile}}" = "production" ]; then docker compose --env-file .env.{{profile}} -p pastebox-{{profile}} pull; fi
    docker compose --env-file .env.{{profile}} -p pastebox-{{profile}} up -d

# Stop environment (default: staging)
down profile="staging":
    @echo "Stopping {{profile}} environment..."
    docker compose --env-file .env.{{profile}} -p pastebox-{{profile}} down
