BUILDER := "multi-arch-builder"

default: dev

help:
    @echo ""
    @echo "Commands:"
    @echo "  just dev                    - Run development workflow"
    @echo "  just prod                   - Full production build workflow"
    @echo "  just prod --push            - Build and push to Docker Hub"
    @echo "  just                         - Alias for dev"
    @echo "  just help                   - Show this list"
    @echo ""

dev:
    @echo "Running development server..."
    pnpm db:migrate:dev && pnpm dev

prod *ARGS:
    @echo "Running production build..."
    @docker buildx ls | grep -q {{BUILDER}} || docker buildx create --name {{BUILDER}} --driver docker-container
    docker buildx inspect --bootstrap
    docker buildx use {{BUILDER}}

    rm -rf data
    mkdir -p data
    pnpm db:push:prod

    #!/usr/bin/env bash
    set -e
    if [[ "{{ARGS}}" == *"--push"* ]]; then
        docker buildx build --platform linux/amd64,linux/arm64 -t huffmanks/pastebox:latest --push .
    else
        docker buildx build -t huffmanks/pastebox:latest --load .
    fi

    rm -rf data
    docker buildx rm {{BUILDER}} || true
    @echo "Build complete."