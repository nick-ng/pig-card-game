import dotenv from "dotenv";
dotenv.config();

import express from "express";
import compression from "compression";
import path from "path";
import http from "http";
import cors from "cors";

import gameRouter from "./game/game-router";
import GameWebSocketServer from "./game/game-websocket";
import { streamHelper } from "./game/game-redis";

const app = express();
const server = http.createServer(app);

new GameWebSocketServer(
  {
    server,
    maxPayload: 51200, // 50 KB
  },
  streamHelper
);

const port = process.env.PORT || 3232;
app.set("port", port);

if (process.env.NODE_ENV === "dev") {
  app.use((req, _res, next) => {
    console.debug(new Date().toLocaleTimeString(), req.method, req.url);
    next();
  });
}

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(compression());
app.use(express.json());

app.use("/api/game", gameRouter);

// serve static files
app.use(express.static(path.resolve(process.cwd(), "dist-front")));
app.use(express.static(path.resolve(process.cwd(), "static")));

if (process.env.NODE_ENV === "dev") {
  console.info("Dev environment");
  app.use(express.static(path.resolve(process.cwd(), "dev-tools")));
}

// redirect all other requests to index.html
app.use((_req, res) => {
  res.sendFile(path.resolve(process.cwd(), "dist-front", "index.html"));
});

// starting listening
server.listen(app.get("port"), () => {
  console.info(
    `${new Date().toLocaleTimeString()} Website server listening on ${app.get(
      "port"
    )}.`
  );
});
