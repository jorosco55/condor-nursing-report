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

# 1. Create the custom server script with the SPA Catch-All route
RUN echo "const express = require('express'); \
const basicAuth = require('express-basic-auth'); \
const path = require('path'); \
const app = express(); \
const port = process.env.PORT || 8080; \
app.use(basicAuth({ \
    users: { 'admin': 'starktech' }, \
    challenge: true \
})); \
app.use(express.static('www')); \
app.get('*', (req, res) => { \
    res.sendFile(path.resolve(__dirname, 'www', 'index.html')); \
}); \
app.listen(port, '0.0.0.0', () => console.log('Server running on port ' + port));" > server.js

# 2. Install dependencies
RUN npm install express express-basic-auth

# 3. Copy built app
COPY --from=build /app/www ./www

# 4. Exposure
ENV PORT=8080
EXPOSE 8080

# 5. Launch
CMD ["node", "server.js"]