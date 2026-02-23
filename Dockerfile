# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the application
FROM node:20-alpine
WORKDIR /app

# 1. Create a custom server script on the fly
# This handles the Basic Auth and serving the 'www' folder securely.
RUN echo "const express = require('express'); \
const basicAuth = require('express-basic-auth'); \
const app = express(); \
const port = process.env.PORT || 8080; \
app.use(basicAuth({ \
    users: { 'admin': 'starktech' }, \
    challenge: true \
})); \
app.use(express.static('www')); \
app.listen(port, '0.0.0.0', () => console.log('Server running on port ' + port));" > server.js

# 2. Install the necessary lightweight server packages
RUN npm install express express-basic-auth

# 3. Copy the built application from Stage 1
COPY --from=build /app/www ./www

# 4. Exposure
ENV PORT=8080
EXPOSE 8080

# 5. Launch the custom server
CMD ["node", "server.js"]