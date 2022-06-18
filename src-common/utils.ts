export const sleep = (ms: number) =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });

export const prevPlayer = (turnOrder: string[], activePlayer: string) => {
  const prevIndex =
    turnOrder.findIndex((player) => player === activePlayer) - 1;
  if (prevIndex < 0) {
    return turnOrder[turnOrder.length - 1];
  }

  return turnOrder[prevIndex];
};
