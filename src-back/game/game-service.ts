import { ActionIncomingMessageObject } from "src-common/websocket-message-types";
import Game from "./game-class";
import { saveGame, findGame } from "./game-redis";

export const newGame = async (
  playerId: string,
  playerName: string,
  playerPassword: string
) => {
  const game = new Game({ host: playerId });
  game.addPlayer(playerId, playerName, playerPassword);

  saveGame(game.getGameData());

  return {
    code: 200,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};

export const joinGame = async (
  gameId: string,
  playerId: string,
  playerName: string,
  playerPassword: string
) => {
  const game = await findGame(gameId);

  if (!game) {
    return { code: 404 };
  }

  const result = game.addPlayer(playerId, playerName, playerPassword);
  if (result.type !== "success") {
    return {
      code: 400,
      message: result.message,
    };
  }

  saveGame(game.getGameData());

  return {
    code: 200,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};

export const playGame = async (
  gameId: string,
  playerId: string,
  playerPassword: string,
  action: string,
  payload: any
) => {
  const game = await findGame(gameId);

  if (!game) {
    return { code: 404 };
  }

  const result = game.gameAction(playerId, playerPassword, {
    type: action,
    payload,
  });

  if (result.type !== "success") {
    return {
      code: 400,
      message: result.message,
      gameData: game.getGameDataForPlayer(playerId, playerPassword),
    };
  }

  saveGame(game.getGameData(), true);

  return {
    code: 200,
    message: result.message,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};

export const playGame2 = async (messageObject: ActionIncomingMessageObject) => {
  const { gameId, playerId, playerPassword, action } = messageObject;
  const { type: actionType, payload } = action;

  const game = await findGame(gameId);

  if (!game) {
    return { code: 404 };
  }

  const result = game.gameAction(playerId, playerPassword, {
    type: actionType,
    payload,
  });

  if (result.type !== "success") {
    return {
      code: 400,
      message: result.message,
      gameData: game.getGameDataForPlayer(playerId, playerPassword),
    };
  }

  saveGame(game.getGameData(), true);

  return {
    code: 200,
    message: result.message,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};

export const getGame = async (
  gameId: string,
  playerId: string,
  playerPassword: string
) => {
  const game = await findGame(gameId);

  if (!game) {
    return { code: 404 };
  }

  return {
    code: 200,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};
