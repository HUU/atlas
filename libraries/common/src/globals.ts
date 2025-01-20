/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-type-assertion,@typescript-eslint/no-unsafe-member-access -- forcefully treating global as a property bag (any) since that's all we need it for to make this work */
export class GlobalSingleton<T> {
  private readonly sym: symbol;

  constructor(uniqueName: string, factory: () => T) {
    this.sym = Symbol.for(uniqueName);
    this.value ??= factory();
  }

  get value(): T {
    return (global as any)[this.sym] as T;
  }

  set value(value: T) {
    (global as any)[this.sym] = value;
  }
}

export class GlobalJustInTimeSingleton<T> {
  private readonly sym: symbol;
  private readonly factory: () => T;

  constructor(uniqueName: string, factory: () => T) {
    this.sym = Symbol.for(uniqueName);
    this.factory = factory;
  }

  get exists(): boolean {
    return (global as any)[this.sym] != null;
  }

  get value(): T {
    if ((global as any)[this.sym] == null) {
      this.value = this.factory();
    }

    return (global as any)[this.sym] as T;
  }

  set value(value: T) {
    (global as any)[this.sym] = value;
  }
}
