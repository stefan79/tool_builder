# Tool Builder

A TypeScript-based tool builder service that supports both file-based and etcd-based storage for tool definitions.

## Prerequisites

- Node.js (recommended to use NVM for version management)
- npm
- etcd3 (optional, if using etcd storage)

## Setup

1. Install NVM (Node Version Manager) if not already installed:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

2. Install and use the latest LTS version of Node.js:
```bash
nvm install --lts
nvm use --lts
```

3. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following configuration options:

```env
# Repository Configuration
REPOSITORY_TYPE=file     # Options: 'file' or 'etcd'

# File Repository Settings (if REPOSITORY_TYPE=file)
FILE_REPOSITORY_PATH=./data    # Default: './data'

# Etcd Repository Settings (if REPOSITORY_TYPE=etcd)
ETCD_ENDPOINTS=localhost:2379  # Comma-separated list of endpoints
ETCD_DIAL_TIMEOUT=5000        # Connection timeout in milliseconds

# OpenAI Configuration (if using LLM tools)
OPENAI_API_KEY=your_api_key_here
```

## Available Scripts

- `npm run dev`: Start the development server with hot-reload
- `npm run debug`: Start the server in debug mode
- `npm run build`: Build the TypeScript project
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Run ESLint and fix issues
- `npm run test`: Run tests
- `npm run inspector`: Run the Model Context Protocol inspector

## API Endpoints

### Tools API

All tool endpoints support YAML format for request/response bodies.

#### List Tools
- **GET** `/api/tools`
- Returns a list of all tool IDs
- Response: YAML list of tool IDs

#### Get Tool
- **GET** `/api/tools/:id`
- Returns details of a specific tool
- Response: Tool definition in YAML format

#### Create/Update Tool
- **POST** `/api/tools`
- Content-Type: `application/x-yaml`
- Request Body: Tool definition in YAML format
- Response: Created/updated tool definition in YAML format

#### Delete Tool
- **DELETE** `/api/tools/:id`
- Deletes a specific tool

### Tool Definition Format

Tools are defined in YAML format with the following structure:

```yaml
name: string
version: string
id: string
description: string
request:
  - name: string
    type: string
    description: string
response:
  - name: string
    type: string
    description: string
engine:
  type: rest|llm
  # Additional engine-specific configuration
```

## Storage Backends

### File Storage
- Tools are stored as individual YAML files
- Default storage location: `./data`
- Files are named as `<tool_id>.yml`

### Etcd Storage
- Tools are stored as JSON in etcd
- Default endpoint: `localhost:2379`
- Keys are tool IDs
- Values are JSON-serialized tool definitions

## Development

1. Start the development server:
```bash
npm run dev
```

2. The server will start on port 3000 by default

3. Use the API endpoints to manage tools

## Testing

Run the test suite:
```bash
npm test
```

## License

ISC License
