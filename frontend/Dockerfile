# ─── Stage 1: Build Frontend ─────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build-time argument for API URL (defaults to localhost:3000/api)
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2: Production Nginx Server ───────────────────
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
