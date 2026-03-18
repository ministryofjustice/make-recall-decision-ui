import { IndeterminateSentenceType } from '../../../@types/make-recall-decision-api/models/IndeterminateSentenceType'

export const indeterminateSentenceType = [
  {
    value: IndeterminateSentenceType.selected.LIFE,
    text: 'Life sentence',
  },
  {
    value: IndeterminateSentenceType.selected.IPP,
    text: 'Imprisonment for Public Protection (IPP) sentence',
  },
  {
    value: IndeterminateSentenceType.selected.DPP,
    text: 'Detention for Public Protection (DPP) sentence',
  },
]

export const indeterminateSentenceTypeFtr56 = [
  {
    value: IndeterminateSentenceType.selected.LIFE,
    text: 'Life sentence',
  },
  {
    value: IndeterminateSentenceType.selected.IPP,
    text: 'Imprisonment for public protection (IPP)',
  },
  {
    value: IndeterminateSentenceType.selected.DPP,
    text: 'Detention for public protection (DPP)',
  },
  {
    value: IndeterminateSentenceType.selected.DHMP,
    text: 'Detention at His Majesty’s pleasure (DHMP)',
    hint: 'Youth indeterminate sentence',
  },
]
