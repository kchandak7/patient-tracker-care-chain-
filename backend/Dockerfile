FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
