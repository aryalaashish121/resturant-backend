const express = require('express')
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const cors = require('cors');
const expressRateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const Database = require('./config/database');
const errorHandle = require('./middleware/error');

//routes
const authRoute = require('./routes/auth');
const app = express();
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT;

//default middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

//list routes

class Server {
    constructor() {
        this.routes();
        this.runServer();
        Database();
    }

    routes() {
        if (process.env.NODE_ENV == "development") {
            app.use(morgan('dev'));
        }
        app.use('/api/v1/auth', authRoute);
        app.use(errorHandle);

        //limiting api hit
        const limiter = expressRateLimit({
            windowMs: 10 * 60 * 1000,
            max: 100
        });
    }

    runServer() {
        const server = app.listen(PORT, () => {
            console.log(`Application running on ${process.env.NODE_ENV} mode with port ${PORT}`.yellow.bold);
        })
    }
}

new Server();