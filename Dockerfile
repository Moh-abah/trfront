# Use Node.js LTS slim
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

# Build the project
RUN npm run build

# Expose the port (3018)
EXPOSE 3018

# Start the Next.js app
CMD ["npm", "start"]
