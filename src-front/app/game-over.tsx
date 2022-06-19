import React from "react";
import styled from "styled-components";

import { PlayerGameData, PlayerDetails } from "../../dist-common/game-types";

interface GameOverProps {
  gameData: PlayerGameData;
  playerDetails: PlayerDetails;
}

const Container = styled.div``;

export default function GameOver({ gameData, playerDetails }: GameOverProps) {
  const { gameState, players, gameSettings } = gameData;

  if (gameState.state !== "over") {
    return <Container>Something went wrong</Container>;
  }

  const { scores } = gameState;
  const playerMap = players.reduce((prev: { [key: string]: string }, curr) => {
    prev[curr.id] = curr.name;
    return prev;
  }, {});

  const winnerEntry = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .find((a) => a[1] >= gameSettings.targetScore);

  if (!winnerEntry) {
    return <Container>Something went wrong</Container>;
  }

  const [winnerId, winnerScore] = winnerEntry;

  let isWinnerYou = winnerId === playerDetails.playerId;

  return (
    <Container>
      {isWinnerYou ? (
        <h2>You won with {winnerScore} points!</h2>
      ) : (
        <p>
          {playerMap[winnerId]} won with {winnerScore} points.
        </p>
      )}

      <div>
        Scores:
        <ul>
          {Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map((entry) => {
              const [id, score] = entry;
              return <li key={id}>{`${playerMap[id]}: ${score}`}</li>;
            })}
        </ul>
      </div>
    </Container>
  );
}
