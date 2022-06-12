import { streamHelper } from "./game-redis";
import Game from "./game-class";

export default class GameServer {
  allGames: Game[];

  constructor() {
    this.allGames = [];
  }
}
