import React from "react";
import styled from "styled-components";

import { PlayerGameData, PlayerDetails } from "../../../dist-common/game-types";
import { WebsocketIncomingMessageObject } from "../../../dist-common/websocket-message-types";

import CardsInHand from "./cards-in-hand";

interface PlayingProps {
  gameData: PlayerGameData;
  playerDetails: PlayerDetails;
  sendViaWebSocket: (messageObject: WebsocketIncomingMessageObject) => void;
}

const Container = styled.div``;

export default function Playing({
  gameData,
  playerDetails,
  sendViaWebSocket,
}: PlayingProps) {
  const { id, shortId, gameState, players, yourSecrets, gameSettings } =
    gameData;

  if (gameState.state !== "main") {
    return <Container>Something went wrong</Container>;
  }

  const {} = gameState;
  const playerMap = players.reduce((prev: { [key: string]: string }, curr) => {
    prev[curr.id] = curr.name;
    return prev;
  }, {});

  return (
    <Container>
      <p>Game ID: {shortId}</p>
      <CardsInHand
        cardWidth={10}
        gameData={gameData}
        handleCardChoice={(cardId) => {
          sendViaWebSocket({
            type: "action",
            playerId: playerDetails.playerId,
            playerPassword: playerDetails.playerPassword,
            gameId: id,
            action: {
              type: "choose-card",
              playerId: playerDetails.playerId,
              cardId,
            },
          });
        }}
      />
      <h3>playerMap</h3>
      <pre>{JSON.stringify(playerMap, null, "  ")}</pre>
      <h3>Full Game Data</h3>
      <pre>{JSON.stringify(gameData, null, "  ")}</pre>
    </Container>
  );
}
