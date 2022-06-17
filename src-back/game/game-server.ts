import {
  streamHelper,
  client as redisClient,
  findGame,
  getRedisKeys as getGameKeys,
  saveGame,
  getRedisKeys,
} from "./game-redis";
import Game from "./game-class";

const STATS_REPORT_DELAY_MS = 1000;
const APM_WEIGHT = 3;
const FREE_HEAP_WEIGHT = 3;
export const GAME_STARTER_KEY = "game-starter";

const getStatsKey = (id: string) => `stats:${id}`;

export default class GameServer {
  id: string;
  allGames: Game[];
  statsKey: string;
  actionCount: number;
  actionCountLastReset: number;
  averageActionsPerMinute: number;

  constructor(id: string) {
    this.id = id;
    this.allGames = [];
    this.statsKey = getStatsKey(id);
    this.actionCount = 0;
    this.actionCountLastReset = Date.now();
    this.averageActionsPerMinute = 0;

    streamHelper.addListener({
      streamKey: GAME_STARTER_KEY,
      id: this.id,
      fetchOnAdd: false,
      updateHandler: this.gameStartListener,
    });
    this.reportStats();
    this.startGames();
  }

  getActionStats = () => {
    const tempActionCount = this.actionCount;
    const tempActionCountLastReset = this.actionCountLastReset;
    this.actionCount = 0;
    this.actionCountLastReset = Date.now();
    const elapsed = this.actionCountLastReset - tempActionCountLastReset;
    const newAPM = (tempActionCount / (elapsed + Number.MIN_VALUE)) * 1000 * 60;

    const ratio = 2 / 50; // Smoothing / (1 + Periods)
    this.averageActionsPerMinute =
      newAPM * ratio + this.averageActionsPerMinute * (1 - ratio);

    return {
      actionCount: tempActionCount,
      elapsed,
      actionsPerMinute: this.averageActionsPerMinute,
    };
  };

  startGames = async () => {
    const gameStartRequests = await redisClient.xRevRange(
      GAME_STARTER_KEY,
      "+",
      "-"
    );

    gameStartRequests?.forEach((gameStartRequest) => {
      this.handleGameStart(gameStartRequest.message.data);
    });
  };

  handleGameStart = async (gameStartRequestJSONString: string) => {
    const gameStartRequestData = JSON.parse(gameStartRequestJSONString);
    const { gameId } = gameStartRequestData;

    if (this.allGames.map((a) => a.id).includes(gameId)) {
      return;
    }

    const game = await findGame(gameId);

    if (game !== null) {
      this.allGames.push(game);
      streamHelper.addListener({
        streamKey: getGameKeys(game.id).action,
        id: game.id,
        fetchOnAdd: true,
        updateHandler: this.makeActionListener(game),
      });
    }
  };

  makeActionListener =
    (game: Game) =>
    (_message: string | null, messageObject: { [key: string]: any } | null) => {
      if (messageObject === null) {
        return;
      }
      this.actionCount += 1;

      const { playerId, playerPassword, action } = messageObject;

      const result = game.gameAction(playerId, playerPassword, action);

      if (result.type !== "success") {
        return;
      }

      saveGame(game.getGameData(), true);
    };

  gameStartListener = (message: string) => {
    this.handleGameStart(message);

    const ids = [...streamHelper.listeners]
      .map((a) => a.id)
      .filter((a) => a !== this.id);

    ids.forEach(async (id) => {
      const { state: stateKey, action: actionKey } = getRedisKeys(id);
      const keyExists = await redisClient.exists(stateKey);

      if (keyExists > 0) {
        return;
      }

      redisClient.del(actionKey);
      streamHelper.removeListener(id);
    });
  };

  getStats = () => {
    const memoryUsage = process.memoryUsage();
    return {
      id: this.id,
      memoryUsage,
      heapFree: memoryUsage.heapTotal - memoryUsage.heapUsed,
      games: this.allGames.length,
      timestamp: Date.now(),
      ...this.getActionStats(),
    };
  };

  reportStats = async () => {
    redisClient.set(this.statsKey, JSON.stringify(this.getStats()));
    redisClient.expire(this.statsKey, (STATS_REPORT_DELAY_MS * 10) / 1000);

    setTimeout(() => {
      this.reportStats();
    }, STATS_REPORT_DELAY_MS + Math.random() * 0.1 * STATS_REPORT_DELAY_MS);
  };
}

export const checkStats = async () => {
  let allStats = [];

  for await (const key of redisClient.scanIterator({
    TYPE: "string",
    MATCH: getStatsKey("*"),
  })) {
    try {
      const statsJSONString = await redisClient.get(key);
      if (typeof statsJSONString === "string") {
        const stats = JSON.parse(statsJSONString);
        allStats.push(stats);

        if (
          !stats.timestamp ||
          stats.timestamp > Date.now() + 11 * STATS_REPORT_DELAY_MS
        ) {
          redisClient.del(key);
        }
      }
    } catch (e) {
      console.info("error on", key);
      console.error("Error when checking stats", e);
    }
  }

  return allStats;
};

export const startGame = async (gameId: string) => {
  try {
    const serverStats = await checkStats();

    if (serverStats.length === 0) {
      return false;
    }

    const serverId = serverStats.sort((a, b) => {
      const aa =
        FREE_HEAP_WEIGHT * a.heapFree - APM_WEIGHT * a.actionsPerMinute;
      const bb =
        FREE_HEAP_WEIGHT * b.heapFree - APM_WEIGHT * b.actionsPerMinute;

      return aa - bb;
    })[0].id;

    redisClient.xAdd(
      GAME_STARTER_KEY,
      "*",
      {
        data: JSON.stringify({
          gameId,
          serverId,
        }),
      },
      {
        TRIM: {
          strategy: "MAXLEN",
          strategyModifier: "~",
          threshold: 10000,
        },
      }
    );

    return true;
  } catch (e) {
    console.error("Error when starting game", e);
    return false;
  }
};
