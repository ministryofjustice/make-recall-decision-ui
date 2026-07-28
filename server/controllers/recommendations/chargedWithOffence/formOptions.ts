import { IsRecalledOnNewChargedOrConvictedOffence } from '../../../@types/make-recall-decision-api/models/IsRecalledOnNewChargedOrConvictedOffence'

const chargedWithOffenceOptions = [
  {
    value: IsRecalledOnNewChargedOrConvictedOffence.selected.ONLY_CHARGED,
    html: 'Yes, <strong>charged</strong> with a new offence but not convicted',
  },
  {
    value: IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
    html: 'Yes, <strong>charged and convicted</strong> of a new offence',
  },
  {
    value: IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
    html: 'No',
  },
]

export default chargedWithOffenceOptions
