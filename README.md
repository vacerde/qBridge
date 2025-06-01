# qBridge: Comprehensive Full-Stack Coding Platform

qBridge is a powerful development platform that combines workspace management, real-time collaboration, and AI assistance in a single integrated environment.

## Info
This is completely under heavy development. The software is AS IS and do not expect support in any way. Bugs may and probably will appear!

## Features

- **Workspace Management**: Create isolated development environments with preconfigured templates
- **Real-time Collaboration**: Work with your team simultaneously on the same codebase
- **AI Assistant Integration**: Get help from multiple AI providers for coding tasks
- **Remote Connectivity**: Connect via SSH/SFTP for file transfers and command execution
- **Deployment Pipeline**: Deploy your applications directly from the platform

## Technology Stack

- **Frontend**: Next.js with ShadCN UI framework
- **Backend**: Rust-based services
- **IDE**: Self-hosted VSCode or code-server instance
- **Authentication**: Custom email + username + password system
- **Collaboration**: WebSocket-based real-time communication
- **Containerization**: Docker for workspace isolation

## Project Structure

- `/frontend`: Next.js application
- `/backend`: NodeJS backend service
- `docker-compose.yml`: Configuration for running all services (Not tested!)
- `run.sh`: Main startup script

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ for local development

### Development Setup

1. Clone the repository
   ```
   git clone https://github.com/vacerde/qBridge.git
   cd qBridge
   ```

2. Start the development environment
   ```
   ./run.sh
   ```

3. Access the platform at http://localhost:3000

## Architecture Overview

qBridge uses a microservices architecture with the following components:

1. **Frontend Service**: Next.js application for the user interface
2. **Backend API**: Rust service handling authentication, user management, and coordination
3. **Workspace Service**: Rust service managing Docker containers for isolated workspaces
4. **Database**: PostgreSQL for persistent storage
5. **AI Integration Service**: Interface to multiple AI providers (OpenAI, Groq, Claude, Ollama)

Each workspace is a separate Docker container running code-server (VS Code in the browser) with appropriate configuration and extensions.

## Security Considerations

- All communication between services uses encrypted channels
- Authentication is handled via JWTs with proper expiration
- Workspaces are isolated using Docker containers
- Access control is enforced for all resources
- Regular security audits and updates are performed

## License

This project is proprietary and confidential. Unauthorized copying, redistribution, or use is strictly prohibited.