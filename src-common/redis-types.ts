export interface DefaultStreamMessageType {
  id: string;
  message: { data: string };
}

export interface Listener {
  streamKey: string;
  id: string;
  updateHandler(
    message: string | null,
    messageObject: { [key: string]: any } | null,
    lastMessageId: string
  ): void;
}
