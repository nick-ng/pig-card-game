interface BasicAction {
  type: string;
  payload?: any;
}

export interface StartAction extends BasicAction {
  type: "start";
}

export interface RollAction extends BasicAction {
  type: "roll";
}

export interface BankAction extends BasicAction {
  type: "bank";
}

export type InputAction = BasicAction | StartAction | BankAction;

export type GameAction = InputAction & {
  playerId: string;
};
