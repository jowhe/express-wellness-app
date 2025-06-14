# Use a minimal base image
FROM node:20-alpine AS base

# Create app directory
WORKDIR /

# Copy only necessary files first for better caching
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy app source code
COPY . .

# Use a non-root user for security (optional)
RUN addgroup -S app && adduser -S app -G app
USER app

# Expose the app port (optional, depends on your app)
EXPOSE ${PORT:-10101}

# Start the app
CMD ["node", "/src/app.js"]
