import { GameData, Scores, ActionReturn } from "../../dist-common/game-types";
import { GameAction } from "../../dist-common/game-action-types";
import { nextPlayer } from "../../dist-common/utils";

const startGame = (gameData: GameData, action: GameAction): ActionReturn => {
  const { gameState, gameSecrets, players, host } = gameData;
  if (gameState.state !== "lobby") {
    return {
      newState: gameState,
      newSecrets: gameSecrets,
      message: "Game is already in progress.",
    };
  }

  if (action.playerId !== host) {
    return {
      newState: gameState,
      newSecrets: gameSecrets,
      message: "Only the host can start the game.",
    };
  }

  const turnOrder = players
    .map((a) => ({ ...a, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((a) => a.id);

  const scores: Scores = {};
  turnOrder.forEach((playerId) => {
    scores[playerId] = 0;
  });

  return {
    newState: {
      ...gameState,
      state: "main",
      activePlayer: turnOrder[0],
      turnOrder,
      scores,
      turnScore: 0,
    },
    newSecrets: gameSecrets,
    message: "OK",
  };
};

const rollDice = (gameData: GameData, action: GameAction): ActionReturn => {
  const { gameSettings, gameState, gameSecrets } = gameData;
  if (gameState.state !== "main") {
    return {
      newState: gameState,
      newSecrets: gameSecrets,
      message: "Game not in progress.",
    };
  }
  if (action.playerId !== gameState.activePlayer) {
    return {
      newState: gameState,
      newSecrets: gameSecrets,
      message: "Not your turn.",
    };
  }

  let turnScore = gameState.turnScore;

  const { diceSize, diceCount, pigNumber } = gameSettings;

  let roll = 0;

  for (let n = 0; n < diceCount; n++) {
    roll += Math.floor(Math.random() * diceSize) + 1;
  }

  if (roll === pigNumber) {
    return {
      newState: {
        ...gameState,
        activePlayer: nextPlayer(gameState.turnOrder, gameState.activePlayer),
        turnScore: 0,
        lastRoll: roll,
      },
      newSecrets: gameSecrets,
      message: "OK",
    };
  }

  turnScore += roll;

  return {
    newState: { ...gameState, turnScore, lastRoll: roll },
    newSecrets: gameData.gameSecrets,
    message: "OK",
  };
};

const bankPoints = (gameData: GameData, action: GameAction): ActionReturn => {
  const { gameSettings, gameState, gameSecrets } = gameData;
  if (gameState.state !== "main") {
    return {
      newState: gameState,
      newSecrets: gameSecrets,
      message: "Game not in progress.",
    };
  }
  if (action.playerId !== gameState.activePlayer) {
    return {
      newState: gameState,
      newSecrets: gameSecrets,
      message: "Not your turn.",
    };
  }

  const { playerId } = action;

  const { scores, turnScore, turnOrder, activePlayer } = gameState;

  scores[playerId] += turnScore;

  if (scores[playerId] >= gameSettings.targetScore) {
    return {
      newState: {
        ...gameState,
        scores,
        state: "over",
      },
      newSecrets: gameSecrets,
      message: "OK",
    };
  }

  return {
    newState: {
      ...gameState,
      scores,
      turnScore: 0,
      activePlayer: nextPlayer(turnOrder, activePlayer),
    },
    newSecrets: gameSecrets,
    message: "OK",
  };
};

export const performAction = (
  gameData: GameData,
  action: GameAction
): ActionReturn => {
  switch (action.type) {
    case "start":
      return startGame(gameData, action);
    case "roll":
      return rollDice(gameData, action);
    case "bank":
      return bankPoints(gameData, action);
    default:
      return {
        newState: gameData.gameState,
        newSecrets: gameData.gameSecrets,
        message: "No action",
      };
  }
};
