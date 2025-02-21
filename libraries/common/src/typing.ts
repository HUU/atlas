/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access -- these are all typing predicts and similar helpers that need to work on any's */

export function isThenable(wat: any): wat is PromiseLike<any> {
  return Boolean(wat?.then != null && typeof wat.then === 'function');
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- defining a type predicate for a callable and "function" is the only appropriate type for that
export function isCallable(wat: any): wat is Function {
  return Boolean(wat != null && typeof wat === 'function');
}

export function isEmpty<T extends { length: number }>(
  wat: T | undefined | null,
): wat is undefined | null {
  return wat == null || wat.length === 0;
}

export type FireAndForgetCallback = () => unknown;

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type WithOptional<T, TKey extends keyof T> = Omit<T, TKey> & Partial<T>;

export type WithRequired<T, TKey extends keyof T> = Omit<T, TKey> &
  NonNullableFields<Pick<Required<T>, TKey>>;

export function nameOf<TObject>(obj: TObject, key: keyof TObject): string;

export function nameOf<TObject>(key: keyof TObject): string;
export function nameOf(key1: any, key2?: any): any {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- intentionally juggling any's due to non-overlapping types for key1 in the overloads above
  return key2 ?? key1;
}
