import { streamHelper, client as redisClient } from "./game-redis";
import Game from "./game-class";

const STATS_REPORT_DELAY_MS = 1000;

/**
 * - All game servers are listening to a "new-game" stream
 * - Each game server puts its ID, the current timestamp and the number of games it's handling on a store somewhere
 * - When a new game is created, the web server checks the number of games each server is handling and chooses the one that has the fewest games
 *   - If there's a tie, one of the tie-breaks is randomly chosen
 * - The web server then adds an event to the "new-game" stream that has the game ID and the game server ID.
 * - The nominated game server then starts handling the game and increases its games handled count
 * - When a game is over, the server stops listening to it.
 *
 * - When a game server gets terminated, it performs the above for all games it
 * - When a game server crashes, ?
 */
export default class GameServer {
  id: string;
  allGames: Game[];
  statsKey: string;
  actionCount: number;
  actionCountLastReset: number;

  constructor(id: string) {
    this.id = id;
    this.allGames = [];
    this.statsKey = `stats:${id}`;
    this.actionCount = 0;
    this.actionCountLastReset = Date.now();
  }

  getActionStats = () => {
    const currentActionCount = this.actionCount;
    const currentActionCountLastReset = this.actionCountLastReset;
    this.actionCount = 0;
    this.actionCountLastReset = Date.now();
    const elapsed =
      this.actionCountLastReset -
      currentActionCountLastReset +
      Number.MIN_VALUE;

    return {
      actionCount: currentActionCount,
      elapsed,
      actionsPerMinute: (currentActionCount / elapsed) * 1000 * 60,
    };
  };

  getStats = () => {
    return {
      memoryUsage: process.memoryUsage(),
      ...this.getActionStats(),
    };
  };

  // publish your stats to a redis store
  reportStats = async () => {
    // 10. Check if you died?

    // 20. Update stats
    redisClient.set(this.statsKey, JSON.stringify(this.getStats()));

    setTimeout(() => {
      this.reportStats();
    }, STATS_REPORT_DELAY_MS);
  };
}
