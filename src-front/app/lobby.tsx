import React from "react";
import styled from "styled-components";
import QRCode from "react-qr-code";

import { GameData, PlayerDetails } from "../../src-common/game-types";

declare const API_ORIGIN: string;

interface LobbyProps {
  gameData: GameData;
  playerDetails: PlayerDetails;
}

const Container = styled.div``;

const Details = styled.details`
  margin: 1em 0;

  summary {
    cursor: pointer;
  }
`;

const QuiteZone = styled.div`
  background-color: white;
  padding: 16px;
  display: inline-block;
`;

export default function Lobby({ gameData, playerDetails }: LobbyProps) {
  const { players, maxPlayers, host } = gameData;

  const canJoinGame =
    !players.map((a) => a.id).includes(playerDetails.playerId) && // Not already in the game
    players.length < maxPlayers; // Game has room
  const isHost = host === playerDetails.playerId;

  return (
    <Container>
      <Details>
        <summary>QR Code</summary>
        <QuiteZone>
          <QRCode value={location.href} />
        </QuiteZone>
      </Details>
      {isHost && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(location.href);
          }}
        >
          Copy Game Link
        </button>
      )}
      <h2>Players In Game</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
      {canJoinGame && (
        <button
          onClick={async () => {
            await fetch(`${API_ORIGIN}/api/game/${gameData.id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json;charset=utf-8",
                "x-player-id": playerDetails.playerId,
                "x-player-password": playerDetails.playerPassword,
              },
              body: JSON.stringify({
                action: "join",
                playerName: playerDetails.playerName,
              }),
            });
          }}
        >
          Join Game
        </button>
      )}
      {isHost && (
        <button
          onClick={async () => {
            const res = await fetch(`${API_ORIGIN}/api/game/${gameData.id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json;charset=utf-8",
                "x-player-id": playerDetails.playerId,
                "x-player-password": playerDetails.playerPassword,
              },
              body: JSON.stringify({
                action: "start",
              }),
            });

            const { message, gameData: newGameData } = (await res.json()) as {
              message: string;
              gameData: GameData;
            };
          }}
        >
          Start Game
        </button>
      )}
    </Container>
  );
}
