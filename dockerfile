# -------------------------------
# Base Image
# -------------------------------
FROM node:22-bookworm-slim AS base

# Prevent npm from running as root
ENV NODE_ENV=production
ENV UPLOAD_DIR=/data

# -------------------------------
# Install system dependencies
# Sharp needs libvips
# -------------------------------
RUN apt-get update && apt-get install -y \
    libvips \
    dumb-init \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------
# Create non-root user
# -------------------------------
RUN useradd -m -u 10001 appuser

# -------------------------------
# App Directory
# -------------------------------
WORKDIR /app

# -------------------------------
# Install Dependencies (Layer Caching)
# -------------------------------
COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

# -------------------------------
# Copy Application Source
# -------------------------------
COPY . .

# -------------------------------
# Permissions
# -------------------------------
RUN chown -R appuser:appuser /app

# -------------------------------
# Creating Data Directory
# -------------------------------
RUN mkdir /data

# -------------------------------
# Permissions for data directory
# -------------------------------
RUN chown -R appuser:appuser /data

# -------------------------------
# Switch to Non-Root User
# -------------------------------
USER appuser

# -------------------------------
# Expose App Port
# -------------------------------
EXPOSE 3000

# -------------------------------
# Runtime Safety
# -------------------------------
ENTRYPOINT ["dumb-init", "--"]

# -------------------------------
# Start App
# -------------------------------
CMD ["node", "server.js"]
