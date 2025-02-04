import { RoshData } from '../../../@types/make-recall-decision-api'
import { hasValue } from '../../../utils/utils'
import { RoshEnum } from '../../../@types/make-recall-decision-api/models/RoshData'

export type Rosh = {
  riskToChildren: string
  riskToPublic: string
  riskToKnownAdult: string
  riskToStaff: string
  riskToPrisoners: string
}

export function currentHighestRosh(rosh?: Rosh | null) {
  if (!hasValue(rosh)) {
    return undefined
  }

  const values = []

  function mapToNumber(val: string) {
    if (val === RoshEnum.VERY_HIGH) {
      return 1
    }
    if (val === RoshEnum.HIGH) {
      return 2
    }
    if (val === RoshEnum.MEDIUM) {
      return 3
    }
    if (val === RoshEnum.LOW) {
      return 4
    }
    if (val === RoshEnum.NOT_APPLICABLE) {
      return 5
    }
  }

  function mapFromNumber(val: number) {
    switch (val) {
      case 1:
        return 'Very High'
        break
      case 2:
        return 'High'
        break
      case 3:
        return 'Medium'
        break
      case 4:
        return 'Low'
        break
      case 5:
        return 'Not Applicable'
        break
      default:
    }
  }

  values.push(mapToNumber(rosh.riskToChildren))
  values.push(mapToNumber(rosh.riskToPublic))
  values.push(mapToNumber(rosh.riskToKnownAdult))
  values.push(mapToNumber(rosh.riskToStaff))
  values.push(mapToNumber(rosh.riskToPrisoners))

  values.sort()

  return mapFromNumber(values[0])
}

export const riskOfSeriousHarmLevel = (roshData: RoshData) => {
  return currentHighestRosh({
    riskToChildren: String(roshData?.riskToChildren),
    riskToPublic: String(roshData?.riskToPublic),
    riskToKnownAdult: String(roshData?.riskToKnownAdult),
    riskToPrisoners: String(roshData?.riskToPrisoners),
    riskToStaff: String(roshData?.riskToStaff),
  })
}
