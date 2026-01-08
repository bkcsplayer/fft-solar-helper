# Backend Dockerfile for FFT Solar CRM
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from root
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy server source code
COPY server/ ./server/

# Copy other necessary files
COPY database/ ./database/

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3200

# Set environment
ENV NODE_ENV=production

# Set working directory to server
WORKDIR /app/server

# Start server
CMD ["node", "index.js"]
