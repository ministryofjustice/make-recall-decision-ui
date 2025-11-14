export const determinateCustodyTypes = ['Determinate', 'EDS', 'EDS (non parole)', 'EPP', 'SOPC', 'DCR'] as const

export const indeterminateCustodyTypes = [
  'IPP',
  'DPP',
  'Mandatory (MLP)',
  'Discretionary',
  'Discretionary (Tariff Expired)',
  'Automatic',
] as const

export type DeterminateCustodyType = (typeof determinateCustodyTypes)[number]
export type IndeterminateCustodyType = (typeof indeterminateCustodyTypes)[number]
export type CustodyType = DeterminateCustodyType | IndeterminateCustodyType
