export function callAsyncEventHandler<TResult = void>(
  promise: () => Promise<TResult>,
): () => void;
export function callAsyncEventHandler<TEvent, TResult = void>(
  promise: (event: TEvent) => Promise<TResult>,
): (event: TEvent) => void;
export function callAsyncEventHandler<TEvent, TResult = void>(
  promise: (event: TEvent) => Promise<TResult>,
) {
  return (event: TEvent) => {
    void promise(event);
  };
}
