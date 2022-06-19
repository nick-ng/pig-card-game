import { randomUUID } from "crypto";
import {
  GameAction,
  ChooseCardAction,
} from "../../dist-common/game-action-types";
import Game from "./game-class";
import { shuffle } from "./utils";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const startGame = (
  game: Game,
  action: GameAction
): { game: Game; message: string } => {
  const { gameState, gameSettings, playerSecrets, players, host } = game;
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
  action: ChooseCardAction
): { game: Game; message: string } => {
  const { gameState, playerSecrets, players } = game;
  if (gameState.state !== "main") {
    return {
      game,
      message: "You can't do that right now.",
    };
  }

  const { playerId, cardId } = action;
  const { cardsInHand } = playerSecrets[playerId];
  const { chosenCardPlayers } = gameState;

  if (!cardsInHand?.includes(cardId)) {
    return {
      game,
      message: "You don't have that card.",
    };
  }

  if (playerSecrets[playerId].chosenCard === cardId) {
    return {
      game,
      message: "That's already your chosen card.",
    };
  }

  playerSecrets[playerId].chosenCard = cardId;

  const uniqueChosenCardPlayers = new Set(chosenCardPlayers);
  uniqueChosenCardPlayers.add(playerId);
  gameState.chosenCardPlayers = [...uniqueChosenCardPlayers];

  if (uniqueChosenCardPlayers.size < players.length) {
    return {
      game,
      message: "OK",
    };
  }

  // Pass cards

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

/**
 * If performAction gets called, the game has already verified the player's identity
 */
export const performAction = (
  game: Game,
  action: GameAction
): { game: Game; message: string } => {
  switch (action.type) {
    case "start":
      return startGame(game, action);
    case "choose-card":
      return chooseCard(game, action as ChooseCardAction);
    case "finger-on-nose":
      return fingerOnNose(game, action);
    default:
      return { game, message: "OK" };
  }
};
