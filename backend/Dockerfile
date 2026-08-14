FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy backend application source
COPY . .

# Expose backend port
EXPOSE 5001

# Default environment variables
ENV PORT=5001
ENV NODE_ENV=production

# Start server
CMD ["node", "src/server.js"]
