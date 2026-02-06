import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import logging from "./config/logging";
import config from "./config/config";
import router from "./routes";
import { resolve } from "path";

const NAMESPACE = "Server";
const HTTP_PORT = process.env.HTTP_PORT || 2345;

// Init new app
const app = express();

// Setup cors middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT"],
    }),
);

// Logging the request
app.use((req, res, next) => {
    logging.info(
        NAMESPACE,
        `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`,
    );

    res.on("finish", () => {
        logging.info(
            NAMESPACE,
            `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`,
        );
    });
    next();
});

// Parse the request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// API rules
app.use((req, res, next) => {
    // *******************************
    //   REMOVE BELOW IN PRODUCTION
    // *******************************
    res.header("Access-Control-Allow-Origin", "*");

    if (req.method == "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST PUT");
        return res.status(200).json({});
    }
    next();
});

// Routes
app.use("/api", router);

// Handle errors
app.use((req, res, next) => {
    const error = new Error("Not Found");

    res.status(404).json({
        message: error.message,
    });
});

const httpServer = http.createServer(app);

httpServer.listen(config.server.port, () =>
    logging.info(
        NAMESPACE,
        `Server is running ${config.server.hostname}:${config.server.port}`,
    ),
);
