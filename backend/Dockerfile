# Simple Dockerfile for NestJS Backend (Development)
FROM node:24-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=5s --timeout=5s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application in development mode
CMD ["npm", "run", "start:dev"]
