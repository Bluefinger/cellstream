import { emitEND } from "../signal";
import { Stream, OperatorFn } from "../types/stream";
import { map } from "./map";
import { makeUInt } from "../utils/makeUInt";

export function take<T>(amount: number): OperatorFn<T, T> {
  let remaining = makeUInt(amount);
  return (source: Stream<T>): Stream<T> =>
    map<T>((value) => (remaining-- ? value : emitEND()))(source);
}
