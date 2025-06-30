export type DataGenerator<T, O> = {
  generate: (options?: O) => T
}

export type DataGeneratorWithSeries<T, O> = {
  generateSeries: (optionsSeries: O[]) => T[]
} & DataGenerator<T, O>

export type NoneOrOption<T> = 'none' | T
export type AnyNoneOrOption<T> = 'any' | 'none' | T
export type IncludeNoneOrOption<T> = 'include' | 'none' | T
