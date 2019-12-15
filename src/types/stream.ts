/**
 * Stream State. Comes with 4 possible states:
 * 0. CLOSED
 * 1. PENDING
 * 2. ACTIVE
 * 3. CHANGING
 */
export type StreamState = 0 | 1 | 2 | 3;

export type StreamValue<T> = T extends Stream<infer V> ? V : never;

export type StreamValuesAsArray<T> = T extends (infer U)[]
  ? StreamValue<U>
  : never;

export type StreamValuesAsTuple<F extends Stream<any>[]> = {
  [K in keyof F]: StreamValue<F[K]>;
};

export type OperatorFn<T, U> = (source: Stream<T>) => Stream<U>;

/**
 * A transformation function. Takes an input value and yields an output value.
 * Used for converting a parent Stream's value into a dependent Stream's value.
 */
export type StreamFn<T, U> = (source: T) => U;

/**
 * Tuple for storing a dependent Stream and its value function.
 * The tuple cannot be mutated once set.
 */
export type DependentTuple<T, U> = readonly [Stream<U>, StreamFn<T, U>];

/**
 * Stream Stream object. Receives values and pushes them to its dependencies,
 * or returns it's current value. Keeps track of its own state and can be
 * terminated or serialised into JSON.
 */
export interface Stream<T> {
  /**
   * Returns the Stream's current value.
   */
  (): T;
  /**
   * Assigns a new value to the Stream and broadcasts it to all its dependencies.
   */
  (value: T): this;
  /**
   * Semphore for tracking when all the parent streams have resolved or changed so that
   * the current Stream can update.
   * @internal
   */
  waiting: number;
  /**
   * Semphore for tracking whether any parents need to update while the current stream is
   * waiting for all parents to resolve.
   * @internal
   */
  updating: boolean;
  /**
   * Flag for dispatcher to not wait for all parents to resolve in order to execute stream.
   * @internal
   */
  immediate: true | undefined;
  /**
   * Current State of the Stream. Possible state values:
   * 0. CLOSED: The Stream is closed. It won't notify any dependents nor be updated by any parents.
   * 1. PENDING: The Stream is pending an update. It has not received any values yet.
   * 2. ACTIVE: The Stream has a value. No actions required to be taken.
   * 3. CHANGING: The Stream is about to change. It is about to receive a value and will update its dependencies.
   */
  state: StreamState;
  /**
   * The Stream's current value. Mutating this property won't cause the Stream to update its
   * dependencies.
   * @internal
   */
  val: T;
  /**
   * A Stream for ending/completing the parent Stream. Causes all parents/dependents
   * subscriptions to be erased from the Stream, and sets its state to CLOSED.
   */
  end: EndStream;
  /**
   * An Array containing tuple values of Dependent Streams and their value functions.
   * The value functions transform the parent Stream's value to the Dependent Stream's
   * value type.
   * @internal
   */
  dependents: DependentTuple<any, any>[];
  /**
   * The Parent Streams that the current Stream is subscribed to. If it not subscribed
   * to any other Streams, it is empty.
   */
  parents: Stream<any>[];

  /* eslint-disable prettier/prettier */
  pipe(): Stream<T>;
  pipe<A>(...operators: [OperatorFn<T, A>]): Stream<A>;
  pipe<A, B>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>]): Stream<B>;
  pipe<A, B, C>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>]): Stream<C>;
  pipe<A, B, C, D>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>]): Stream<D>;
  pipe<A, B, C, D, E>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>]): Stream<E>;
  pipe<A, B, C, D, E, F>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>]): Stream<F>;
  pipe<A, B, C, D, E, F, G>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>]): Stream<G>;
  pipe<A, B, C, D, E, F, G, H>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>]): Stream<H>;
  pipe<A, B, C, D, E, F, G, H, I>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>, OperatorFn<H, I>]): Stream<I>;
  pipe<A, B, C, D, E, F, G, H, I>(...operators: [OperatorFn<T, A>, OperatorFn<A, B>, OperatorFn<B, C>, OperatorFn<C, D>, OperatorFn<D, E>, OperatorFn<E, F>, OperatorFn<F, G>, OperatorFn<G, H>, OperatorFn<H, I>, ...OperatorFn<any, any>[]]): Stream<any>;
  // pipe(...operators: OperatorFn<any, any>[]): Stream<any>;
  /* eslint-enable prettier/prettier */
  toJSON(): any;
}

export interface EndStream extends Stream<boolean> {
  /**
   * Returns the Stream's current value.
   */
  (): boolean;
  /**
   * Assigns a new value to the Stream and broadcasts it to all its dependencies.
   */
  (value: boolean): boolean;
}

/**
 * Signature definition for a Dispatcher function. Must receive a Stream and a value.
 * @internal
 */
export type Dispatcher = <T>(stream: Stream<T>, value: T) => void;

/**
 * Close Function interface. Returns itself to allow terse multilple invocations.
 * @internal
 */
export interface Closer {
  <T>(stream: Stream<T>): this;
}