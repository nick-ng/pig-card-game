import dotenv from "dotenv";
dotenv.config();

import { v4 as uuid } from "uuid";
import GameServer from "./game/game-server";

const WORKER_ID = uuid();

new GameServer(WORKER_ID);
