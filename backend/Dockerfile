FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Skip Puppeteer Chromium download and install dependencies faster
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm ci --only=production --no-audit --no-fund

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]