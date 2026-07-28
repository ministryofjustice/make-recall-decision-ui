export type FormOption = {
  value: string
  text: string
  detailsLabel?: string
  hint?: string
}

export type FormOptionsType = {
  [key: string]: FormOption[]
}
