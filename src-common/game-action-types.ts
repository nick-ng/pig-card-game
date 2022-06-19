interface BasicAction {
  playerId: string;
  type: string;
  payload?: any;
}

export interface StartAction extends BasicAction {
  type: "start";
}

export interface ChooseCardAction extends BasicAction {
  type: "choose-card";
  cardId: string;
}

export interface BankAction extends BasicAction {
  type: "bank";
}

export type GameAction = BasicAction | StartAction | ChooseCardAction;
