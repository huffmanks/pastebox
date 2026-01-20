# pastebox

![Screenshot of pastebox dashboard screen.](https://huffmanks.com/portfolio/images/projects/pastebox.png)

A lightweight, self-hosted tool for ephemeral rich text and file sharing on your local network. Designed as a quick digital “drop zone” rather than permanent storage, which prioritizes fast transfers between your devices.

## Features

- Clean, fast interface.
- Supports rich text and file uploads.
- 24-hour automatic expiration, with flexibility to extend.
- Self-hosted and accessible to any device on your local network.
- Easy Docker deployment.

## Usage

### docker-compose.yml

```yaml
services:
  pastebox:
    image: huffmanks/pastebox
    container_name: pastebox
    ports:
      - "3000:3000"
    volumes:
      - uploads:/app/uploads
      - data:/app/data
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped

volumes:
  uploads:
  data:
```

### .env

```txt
NODE_ENV=production
DATABASE_URL=file:./data/prod.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Start container

```sh
docker compose up -d
```

## Open web UI

```sh
open http://localhost:3000
```
