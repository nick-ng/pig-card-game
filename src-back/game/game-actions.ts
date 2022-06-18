import { randomUUID } from "crypto";
import { GameAction } from "../../dist-common/game-action-types";
import Game from "./game-class";
import { shuffle } from "./utils";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const startGame = (
  game: Game,
  action: GameAction
): { game: Game; message: string } => {
  const { gameState, gameSettings, gameSecrets, playerSecrets, players, host } =
    game;
  if (gameState.state !== "lobby") {
    return {
      game,
      message: "Game is already in progress.",
    };
  }

  if (action.playerId !== host) {
    return {
      game,
      message: "Only the host can start the game.",
    };
  }

  const playerIds = players.map((a) => a.id);
  const seatOrder = shuffle(playerIds);

  const cardMap: { [cardId: string]: string } = {};
  let deck: string[] = [];

  for (let n = 0; n < players.length; n++) {
    const letter = LETTERS[n];
    for (let m = 0; m < gameSettings.cardsPerPlayer; m++) {
      const cardId = randomUUID();
      cardMap[cardId] = letter;
      deck.push(cardId);
    }
  }

  const shuffledDeck = shuffle(deck);

  playerIds.forEach((playerId) => {
    const cardsInHand: string[] = [];
    for (let n = 0; n < gameSettings.cardsPerPlayer; n++) {
      cardsInHand.push(shuffledDeck.pop() as string);
    }

    playerSecrets[playerId].chosenCard = "";
    playerSecrets[playerId].cardsInHand = cardsInHand;
  });

  game.gameState = {
    ...game.gameState,
    state: "main",
    seatOrder,
    chosenCardPlayers: [],
    fingerOnNose: [],
    cardMap,
  };

  game.gameSecrets.fullDeck = [...deck];

  return {
    game,
    message: "OK",
  };
};

const chooseCard = (
  game: Game,
  action: GameAction
): { game: Game; message: string } => {
  const { gameSettings, gameState, gameSecrets } = game;

  return {
    game,
    message: "OK",
  };
};

const fingerOnNose = (
  game: Game,
  action: GameAction
): { game: Game; message: string } => {
  const { gameSettings, gameState, gameSecrets } = game;

  return {
    game,

    message: "OK",
  };
};

export const performAction = (
  game: Game,
  action: GameAction
): { game: Game; message: string } => {
  switch (action.type) {
    case "start":
      return startGame(game, action);
    case "choose-card":
      return chooseCard(game, action);
    case "finger-on-nose":
      return fingerOnNose(game, action);
    default:
      return { game, message: "OK" };
  }
};
