# Pig (card game)

Pig is a simple, collecting card game of 20th century American origin suitable for three to thirteen players that is played with a 52-card French-suited pack.

## Development

1. `npm install`
2. `docker-compose up -d` - For local redis environment
3. `npm start`
4. Navigate to one of the following:
   - http://localhost:3232/test.html
   - http://localhost:3232/test-ws.html

## Forking (on different GitHub account)

1. Click the fork button

## Forking (on same or different GitHub account)

1. Create new empty repository on GitHub (or whatever)
2. `git clone https://github.com/nick-ng/pig-card-game.git <new-repo> && cd <new-repo>`
3. Change `pig-card-game` to whatever you want and change my name to your name or something.
4. `git add . && git commit -m "anything. this will get squashed in the next step"`
5. `git reset $(git commit-tree HEAD^{tree} -m "forked https://github.com/nick-ng/pig-card-game")`
6. `git remote remove origin`
7. `git remote add origin <url-of-repo-you-made>`
8. `git push --set-upstream origin main`
9. Change branch permissions etc.

## Deploying to Heroku

1. Create an empty Heroku App. Note the app's name
2. Get your Heroku API key from https://dashboard.heroku.com/account
3. On GitHub repo for your fork, go to the Settings and click on Secrets > Actions
4. Add 3 new repository secrets
   - `HEROKU_API_KEY`: API key from above
   - `HEROKU_APP_NAME`: App name from above
   - `HEROKU_EMAIL`: Email address of your Heroku account
5. Push a commit to the `main` branch.

## ToDos

- [ ] Use a Redis stream for actions and have a single entity responsible for updating game state

## Notes

### Game State

On the server

```json
{
  "id": "1234-12345-12345-1234",
  "host": "some-player's-uuid",
  "maxPlayers": 2,
  "players": [
    { "id": "some-player's-uuid", "name": "Alice" },
    { "id": "player-two's-uuid", "name": "Bob" }
  ],
  // Things about the game that don't change once it's started.
  "gameSettings": {
    "gameSetting1": 3,
    "gameSetting2": "hello"
  },
  // Secret information, only available to some players
  "gameSecrets": {
    "some-player's-uuid": {
      "password": "asdf", // Used to prevent other players performing actions on your behalf.
      "secret1": "world"
    },
    "player-two's-uuid": {
      "password": "bsdf",
      "secret1": "!"
    }
  },
  // Everything else about the game
  "gameState": {
    "state": "main", // "lobby", "upkeep", "draw", "main", "combat", etc.
    "activePlayer": "player-two's-uuid",
    "turnOrder": ["player-two's-uuid", "some-player's-uuid"],
    "score": "etc"
  }
}
```

Sent to Alice

```json
{
  "id": "1234-12345-12345-1234",
  "host": "some-player's-uuid",
  "maxPlayers": 2,
  "players": [
    { "id": "some-player's-uuid", "name": "Alice" },
    { "id": "player-two's-uuid", "name": "Bob" }
  ],
  "gameSettings": {
    "gameSetting1": 3,
    "gameSetting2": "hello"
  },
  "gameSecrets": {
    "password": "asdf",
    "secret1": "world"
  },
  "gameState": {
    "activePlayer": "player-two's-uuid",
    "score": "etc"
  }
}
```

### WebSocket API

If you get disconnected, you need to reconnect and re-listen to the game. You'll still be in the game so you don't need to rejoin it..
