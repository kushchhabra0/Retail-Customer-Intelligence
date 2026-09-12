# Stage 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy built assets from Stage 1 to Nginx HTML folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if needed, or use default
# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
