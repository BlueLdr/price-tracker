export type ValuesOf<T extends object> = {
  [K in keyof T]: T[K];
}[keyof T];

export type EntryOf<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

export type PropsOfType<T extends object, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type StringPropOf<T extends object> = PropsOfType<T, string>;

export type NonNullableProps<T extends object> = Required<{
  [K in keyof T]: NonNullable<T[K]>;
}>;

/**
 * Helper constructor.  Provides argument with both a `const`-like
 * context and contextual awareness (completion as `T`).
 * See also https://github.com/Microsoft/TypeScript/issues/30680
 */
export interface AsConstType<T> {
  <U extends T>(value: U): U;
}

export type WithStateHook<Name extends string, T> = Record<Name, T> &
  Record<`set${Capitalize<Name>}`, React.Dispatch<React.SetStateAction<T>>>;

export type StateSetter<Name extends string, T> = Omit<
  WithStateHook<Name, T>,
  Name
>;

export type ValueAndSetter<Name extends string, T> = Record<Name, T> &
  Record<`set${Capitalize<Name>}`, (value: T) => void>;

export interface DeepStringDict {
  [key: string]: string | DeepStringDict;
}

export type SortDirection = "asc" | "desc";

export type Updater<T extends object, K extends StringPropOf<T>> = (
  id: T[K],
  newValue: React.SetStateAction<T>,
) => void;

export type ModalTarget<
  T extends object,
  K extends StringPropOf<T> = StringPropOf<T>,
> = {
  target: T | undefined;
  onSave: Updater<T, K>;
};
