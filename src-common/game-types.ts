export interface Scores {
  [index: string]: number;
}

export interface LobbyGameState {
  state: "lobby";
}

export interface MainGameState {
  state: "main";
  activePlayer: string;
  turnOrder: string[];
  scores: Scores;
  turnScore: number;
  lastRoll?: number;
}

export interface OverGameState {
  state: "over";
  turnOrder: string[];
  scores: Scores;
}

export type GameState = LobbyGameState | MainGameState | OverGameState;

export interface GameSecret {
  password: string;
  [key: string]: string;
}

export interface GameSecrets {
  [key: string]: GameSecret;
}

export interface GameSettings {
  targetScore: number;
  diceSize: number;
  diceCount: number;
  pigNumber: number;
}

interface Player {
  id: string;
  name: string;
}

export type Players = Player[];

export interface GameData {
  id: string;
  host: string;
  maxPlayers: number;
  players: Players;
  gameSettings: GameSettings;
  gameSecrets: GameSecrets;
  gameState: GameState;
}

export interface InitObject {
  id?: string;
  host: string;
  maxPlayers?: number;
  players?: Players;
  gameSettings?: GameSettings;
  gameSecrets?: GameSecrets;
  gameState?: GameState;
  lastActionId?: string;
  gameServer?: string;
}

export interface ActionReturn {
  newState: GameState;
  newSecrets: GameSecrets;
  message: string;
}

export interface PlayerDetails {
  playerName: string;
  playerId: string;
  playerPassword: string;
}
