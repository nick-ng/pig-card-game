export interface DefaultStreamMessageType {
  id: string;
  message: { data: string };
}

export interface Listener {
  streamKey: string;
  id: string;
  fetchOnAdd: boolean;
  updateHandler(
    message: string,
    messageObject: { [key: string]: any } | null,
    lastMessageId: string
  ): void;
}
