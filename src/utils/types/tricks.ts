/**
 * Helper constructor for metatype definitions.  Provides argument with both a
 * `const`-like context (e.g. for use with `InterfacesFrom`) and contextual
 * awareness (completion as `MetaInterfaces`).
 *
 * See also https://github.com/Microsoft/TypeScript/issues/30680
 */

type MyType = {
  something: any;
};
export const metatypes = <T extends MyType>(input: T): T => input;

/** c/o docs.  Remove types from Y that are assignable to N. */
export type Diff<Y, N> = Y extends N ? never : Y;

export type Subtract<T, N> = Omit<T, keyof N>;

/** The keys in Y that are not keys in N. */
export type DiffKeys<Y, N> = Diff<keyof Y, keyof N>;

/** The properties in Y that are not defined (with any type) in N. */
export type ExcludeProperties<Y, N> = Pick<Y, DiffKeys<Y, N>>;

/** The properties in Y whose keys are not in K. */
export type ExcludeKeys<Y, K> = Pick<Y, Diff<keyof Y, K>>;

export type Overlay<A, B> = ExcludeProperties<A, B> & B;

// Alias for readability
export type Maybe<T> = Partial<T>;

/**
 * Potential (IDE) performance issues, use with caution
 */
export type DeepOverride<Type extends object, Overrides extends object> = {
  [K in keyof Type]: K extends keyof Overrides
    ? Type[K] extends object
      ? Overrides[K] extends object
        ? Type[K] extends any[]
          ? Overrides[K]
          : Overrides[K] extends any[]
          ? Overrides[K]
          : DeepOverride<Type[K], Overrides[K]>
        : Overrides[K]
      : Overrides[K]
    : Type[K];
} & Omit<Overrides, keyof Type>;

export type DeepPartial<Type extends object> = Partial<{
  [K in keyof Type]: Required<Type>[K] extends object
    ? DeepPartial<Required<Type>[K]>
    : Type[K];
}>;
