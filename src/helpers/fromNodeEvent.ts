import { createStream } from "../stream";
import { Stream } from "../types";
import { map } from "../operators/map";
import { EventEmitter } from "events";

export const fromNodeEvent = (
  target: EventEmitter,
  event: string
): Stream<any> => {
  const eventStream = createStream<any>();

  target.on(event, eventStream);
  map<boolean, void>(
    (): void => {
      target.off(event, eventStream);
    }
  )(eventStream.end);

  return eventStream;
};