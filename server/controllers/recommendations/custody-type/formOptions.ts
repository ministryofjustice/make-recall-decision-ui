import { DeterminateCustodyType } from '../../../helpers/ppudSentence/custodyTypes'

export const determinateCustodyType = [
  { value: 'Determinate', text: 'Determinate' },
  { value: 'EDS', text: 'EDS (Extended determinate sentence)' },
  { value: 'EDS (non parole)', text: 'EDCS - non-parole (Extended determinate sentence - non-parole)' },
  { value: 'EPP', text: 'EPP (Extended sentence for public protection)' },
  { value: 'SOPC', text: 'SOPC (Sentence for offenders of particular concern)' },
  { value: 'DCR', text: 'DCR (Discretionary conditional release)' },
] satisfies { value: DeterminateCustodyType; text: string }[]
