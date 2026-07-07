export enum IsRecalledOnNewChargedOrConvictedOffence {
  ONLY_CHARGED = 'ONLY_CHARGED',
  CHARGED_AND_CONVICTED = 'CHARGED_AND_CONVICTED',
  NO = 'NO',
}

const chargedWithOffenceOptions = [
  {
    value: IsRecalledOnNewChargedOrConvictedOffence.ONLY_CHARGED,
    html: 'Yes, <strong>charged</strong> with a new offence but not convicted',
  },
  {
    value: IsRecalledOnNewChargedOrConvictedOffence.CHARGED_AND_CONVICTED,
    html: 'Yes, <strong>charged and convicted</strong> of a new offence',
  },
  {
    value: IsRecalledOnNewChargedOrConvictedOffence.NO,
    html: 'No',
  },
]

export default chargedWithOffenceOptions
