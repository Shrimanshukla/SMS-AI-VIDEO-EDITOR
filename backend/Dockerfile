FROM node:18-alpine

# Install FFmpeg and other required dependencies
RUN apk add --no-cache ffmpeg python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app/backend

# Copy package files
COPY package.json package-lock.json ./

# Install npm dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create temp directory for video processing
RUN mkdir -p temp

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["npm", "start"]
