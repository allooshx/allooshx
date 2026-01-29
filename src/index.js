require('dotenv').config();

const express = require('express');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fetchData = require('../fromWebToProject/index.js');
const routes = require('../routes/index.js');

fetchData.fetchData();

const app = express();

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

routes(app);

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        status: false, 
        message: error.message
    })
})

process.on('unhandledRejection', (reason) => {
    console.log(reason); // the reason of the exception.
    
    process.exit(1);
})

const server = http.createServer(app);
const port = process.env.PORT;

server.listen(port, () => {
    console.log(`Listening on port ${port} ...`);
})