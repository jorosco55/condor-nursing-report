# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the application securely
FROM node:20-alpine
WORKDIR /app

# Initialize a clean environment and install our server tools
RUN npm init -y && npm install express express-basic-auth

# Copy the server script we just created
COPY server.js ./

# Copy the built application from Stage 1
COPY --from=build /app/www ./www

# Set the port and expose it
ENV PORT=8080
EXPOSE 8080

# Launch
CMD ["node", "server.js"]