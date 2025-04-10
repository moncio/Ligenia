# Build stage
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copy app source
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"] 