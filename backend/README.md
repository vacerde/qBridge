# qBridge Backend

A comprehensive full-stack coding platform backend with integrated workspace management, real-time collaboration capabilities, and AI assistance.

## Features

- **Workspace Management**: Docker-based isolated development environments
- **Real-time Collaboration**: WebSocket-based multi-user editing and communication
- **AI Integration**: Support for OpenAI, Groq, Anthropic, and Ollama
- **Authentication**: Secure JWT-based authentication system
- **Deployment**: Automated deployment pipeline similar to Vercel
- **File Management**: SFTP and SSH connectivity for remote development

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for sessions and caching
- **Containerization**: Docker and Docker Compose
- **WebSockets**: Socket.io for real-time features
- **AI**: Multiple AI provider integrations

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd qBridge-backend
\`\`\`

2. Make the startup script executable:
\`\`\`bash
chmod +x run.sh
\`\`\`

3. Run the startup script:
\`\`\`bash
./run.sh
\`\`\`

The script will:
- Check Docker availability
- Create `.env` file from template
- Install dependencies
- Start required services
- Launch the application

### Manual Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Copy environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Edit `.env` with your configuration

4. Start MongoDB and Redis:
\`\`\`bash
docker run -d --name qBridge-mongo -p 27017:27017 mongo:6.0
docker run -d --name qBridge-redis -p 6379:6379 redis:7-alpine
\`\`\`

5. Start the application:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - List user workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `POST /api/workspaces/:id/start` - Start workspace
- `POST /api/workspaces/:id/stop` - Stop workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `GET /api/workspaces/:id/logs` - Get workspace logs

### AI Assistant
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/code` - Code assistance
- `GET /api/ai/models` - Get available models

### Collaboration
- `POST /api/collaboration/invite` - Invite user to workspace
- `GET /api/collaboration/workspace/:id` - Get workspace collaborators
- `POST /api/collaboration/accept/:id` - Accept invitation
- `POST /api/collaboration/reject/:id` - Reject invitation

### Deployment
- `POST /api/deployment` - Deploy workspace
- `GET /api/deployment/workspace/:id` - Get deployments
- `GET /api/deployment/:id` - Get deployment details
- `GET /api/deployment/:id/logs` - Get deployment logs

## WebSocket Events

### Connection
- `join-workspace` - Join workspace for collaboration
- `leave-workspace` - Leave workspace

### Real-time Editing
- `code-change` - Broadcast code changes
- `cursor-update` - Share cursor positions
- `file-operation` - File create/delete/rename operations

### Terminal Sharing
- `terminal-input` - Share terminal commands
- `terminal-output` - Share terminal output

### Chat
- `chat-message` - Workspace chat messages

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `GROQ_API_KEY` - Groq API key
- `ANTHROPIC_API_KEY` - Anthropic API key

## Docker Deployment

### Development
\`\`\`bash
docker-compose -f docker-compose.dev.yml up
\`\`\`

### Production
\`\`\`bash
docker-compose up -d
\`\`\`

## Security Features

- JWT-based authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Session management with Redis
- Docker container isolation

## Monitoring and Logging

- Winston logging with file rotation
- Health check endpoint at `/health`
- Container resource monitoring
- Error tracking and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
