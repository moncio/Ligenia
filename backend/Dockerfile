FROM node:20-alpine

WORKDIR /app

# First, copy only package files to leverage Docker cache
COPY package.json ./
COPY package-lock.json ./

# Install dependencies with specific flags to handle version mismatches
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install --no-package-lock --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Create log directory
RUN mkdir -p logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 