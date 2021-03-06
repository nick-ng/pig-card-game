import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import styled from "styled-components";

import randomUUID from "src-front/utils/random-uuid";
import PreLobby from "./pre-lobby";
import Game from "./game";

const PLAYER_NAME_STORE = "PIG_DICE_GAME_PLAYER_NAME_STORE";
const PLAYER_ID_STORE = "PIG_DICE_GAME_PLAYER_ID_STORE";
const PLAYER_PASSWORD_STORE = "PIG_DICE_GAME_PLAYER_PASSWORD_STORE";

const Container = styled.div`
  padding: 0 1em;
`;

const Form = styled.form`
  label,
  input,
  button {
    display: block;
  }
`;

export default function App() {
  const [playerDetails, setPlayerDetails] = useState(() => {
    return {
      playerName: localStorage.getItem(PLAYER_NAME_STORE) || "",
      playerId: localStorage.getItem(PLAYER_ID_STORE) || "",
      playerPassword: localStorage.getItem(PLAYER_PASSWORD_STORE) || "",
    };
  });
  const [tempPlayerName, setTempPlayerName] = useState("");

  const havePlayerCredentials =
    playerDetails.playerId &&
    playerDetails.playerName &&
    playerDetails.playerPassword;

  return (
    <Container>
      <h1>Pig (Card Game)</h1>
      {playerDetails.playerName ? (
        <p>Hello {playerDetails.playerName}</p>
      ) : (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (!tempPlayerName) {
              alert("Cannot have a blank name");
              return;
            }

            const tempDetails = {
              ...playerDetails,
              playerName: tempPlayerName,
            };

            if (!playerDetails.playerId) {
              tempDetails.playerId = randomUUID();
              localStorage.setItem(PLAYER_ID_STORE, tempDetails.playerId);
            }

            if (!playerDetails.playerPassword) {
              tempDetails.playerPassword = randomUUID();
              localStorage.setItem(
                PLAYER_PASSWORD_STORE,
                tempDetails.playerPassword
              );
            }

            localStorage.setItem(PLAYER_NAME_STORE, tempPlayerName);
            setPlayerDetails(tempDetails);
          }}
        >
          <label>Please enter your name</label>
          <input
            type="text"
            value={tempPlayerName}
            onChange={(e) => {
              setTempPlayerName(
                e.target.value.replaceAll(/[^a-z0-9\-_ ]/gi, "")
              );
            }}
          />
          <button>Save</button>
          <p>
            Entering a name and click save or pressing enter will generate a
            unique ID and password which will be stored in your browser's local
            storage. These are used to identify you when hosting and joining
            games.
          </p>
        </Form>
      )}
      {havePlayerCredentials && (
        <Routes>
          <Route
            path="/"
            element={<PreLobby playerDetails={playerDetails} />}
          />
          <Route
            path=":gameId"
            element={<Game playerDetails={playerDetails} />}
          />
        </Routes>
      )}
    </Container>
  );
}
