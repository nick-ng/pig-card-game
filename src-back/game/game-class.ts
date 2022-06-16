import { v4 as uuid } from "uuid";

import {
  Players,
  InitObject,
  GameSettings,
  GameSecrets,
  GameState,
  LobbyGameState,
} from "../../src-common/game-types";
import { performAction } from "./game-actions";
import { InputAction } from "../../src-common/game-action-types";

export default class Game {
  id: string;
  host: string;
  maxPlayers: number;
  players: Players;
  gameSettings: GameSettings;
  gameSecrets: GameSecrets;
  gameState: GameState;
  lastActionId: string;
  gameServer: string | null;

  constructor(initial: InitObject) {
    if (!initial.host) {
      throw {
        type: "error",
        message:
          "Game needs a host. Initiate with at least { host: hostPlayerId }",
      };
    }

    const defaultGameState: LobbyGameState = {
      state: "lobby",
    };

    const temp = {
      maxPlayers: 2,
      players: [],
      gameSettings: {
        targetScore: 100,
        diceSize: 6,
        diceCount: 1,
        pigNumber: 1,
      },
      gameSecrets: {},
      gameState: defaultGameState,
      lastActionId: "0-0",
      gameServer: null,
      ...initial,
    };

    if (!temp.id) {
      this.id = uuid();
    } else {
      this.id = temp.id;
    }

    this.host = temp.host;
    this.maxPlayers = temp.maxPlayers;

    this.players = temp.players;
    this.gameSettings = temp.gameSettings;
    this.gameSecrets = temp.gameSecrets;
    this.gameState = temp.gameState;
    this.lastActionId = temp.lastActionId;
    this.gameServer = temp.gameServer;
  }

  getGameData = () => {
    return {
      id: this.id,
      host: this.host,
      maxPlayers: this.maxPlayers,
      players: this.players,
      gameSettings: this.gameSettings,
      gameSecrets: this.gameSecrets,
      gameState: this.gameState,
      lastActionId: this.lastActionId,
    };
  };

  getGameDataForPlayer = (playerId: string, playerPassword: string) => {
    if (
      !this.players.map((a) => a.id).includes(playerId) ||
      !this.gameSecrets[playerId] ||
      !playerPassword ||
      this.gameSecrets[playerId].password !== playerPassword
    ) {
      return {
        id: this.id,
        host: this.host,
        maxPlayers: this.maxPlayers,
        players: this.players,
        gameSettings: this.gameSettings,
        gameSecrets: {},
        gameState: this.gameState,
        lastActionId: this.lastActionId,
      };
    }

    return {
      id: this.id,
      host: this.host,
      maxPlayers: this.maxPlayers,
      players: this.players,
      gameSettings: this.gameSettings,
      gameSecrets: this.gameSecrets[playerId],
      gameState: this.gameState,
    };
  };

  // Game lobby stuff
  addPlayer = (
    playerId: string,
    playerName: string,
    playerPassword: string
  ) => {
    if (this.gameState.state !== "lobby") {
      return {
        type: "error",
        message: "Game is already in progress",
      };
    }

    if (!playerPassword) {
      return {
        type: "error",
        message: "Can't have a blank password",
      };
    }

    if (this.players.filter((a) => a.id === playerId).length > 0) {
      return {
        type: "error",
        message: "Player already in the game",
      };
    }

    if (this.players.length >= this.maxPlayers) {
      return {
        type: "error",
        message: "Can't add more players.",
      };
    }

    this.players.push({
      id: playerId,
      name: playerName,
    });
    this.gameSecrets[playerId] = { password: playerPassword };

    return {
      type: "success",
    };
  };

  // Game play stuff
  gameAction = (
    playerId: string,
    playerPassword: string,
    action: InputAction
  ) => {
    if (this.players.filter((a) => a.id === playerId).length === 0) {
      return {
        type: "error",
        message: "You aren't in this game",
      };
    }

    if (this.gameSecrets[playerId].password !== playerPassword) {
      return {
        type: "error",
        message: "Wrong password",
      };
    }

    const { newState, newSecrets, message } = performAction(
      this.getGameData(),
      { ...action, playerId }
    );

    if (message !== "OK") {
      return {
        type: "error",
        message,
      };
    }

    this.gameState = newState;
    this.gameSecrets = newSecrets;

    return {
      type: "success",
      message,
    };
  };
}
