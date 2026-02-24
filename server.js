const express = require('express');
const basicAuth = require('express-basic-auth');
const path = require('path');
const app = express();

const port = process.env.PORT || 8080;

// 1. The Velvet Rope (Basic Auth)
app.use(basicAuth({
    users: { 'admin': 'starktech' },
    challenge: true
}));

// 2. Serve the compiled application files
app.use(express.static('www'));

// 3. The SPA Catch-All (Express v5 compliant)
// If the user requests a route that isn't a file, hand them the app.
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'www', 'index.html'));
});

// 4. Ignite the thrusters
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});