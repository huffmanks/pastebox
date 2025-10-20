# pastebox

A lightweight, self-hostable alternative to Pastebin for sharing text and files on your local network. Perfect for quick file transfers and text sharing between devices without leaving your network.

## Features

- **Simple & Fast** - Clean interface, instant sharing
- **Text Sharing** - Share code snippets, notes, and text
- **File Uploads** - Share any file type
- **Temporary Storage** - All pastes expire after 24 hours
- **Self-Hosted** - Keep your data on your network
- **Docker Ready** - Easy deployment with Docker

## Quick Start

### Self-host with Docker

```sh
git clone https://github.com/huffmanks/pastebox.git
```

```sh
cd pastebox
```

```sh
# Build and run with Docker Compose
docker compose up -d
```

## How It Works

1. **Share** - Upload text or files
2. **Get Link** - Receive a short, shareable URL
3. **Access** - Anyone on your network can view/download
4. **Auto-Cleanup** - Content expires after 24 hours
