import { availableRecallTypes, availableRecallTypesForRecommendation } from './availableRecallTypes'
import { formOptions } from '../formOptions/formOptions'
import { isFixedTermRecallMandatoryForRecommendation } from '../../../utils/fixedTermRecallUtils'

jest.mock('../../../utils/fixedTermRecallUtils')
const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
  ['FIXED_TERM', 'NO_RECALL'].includes(entry.value),
)

describe('availableRecallTypes', () => {
  it('only FTR and No Recall available when FTR is mandatory', () => {
    const actualAvailableRecallTypes = availableRecallTypes()

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })

  it(`all types are available when FTR is discretionary`, () => {
    const actualAvailableRecallTypes = availableRecallTypes()

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })
})

describe('availableRecallTypesForRecommendation', () => {
  it('only FTR and No Recall available when FTR is mandatory', () => {
    ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(true)

    const actualAvailableRecallTypes = availableRecallTypesForRecommendation()

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })
  it('all types are available when FTR is discretionary', () => {
    ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(false)

    const actualAvailableRecallTypes = availableRecallTypesForRecommendation()

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })
})

describe('availableRecallTypes', () => {
  it('only FTR and No Recall available when FTR is mandatory', () => {
    const actualAvailableRecallTypes = availableRecallTypes()

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })

  it('only Standard and No Recall available when Standard is mandatory', () => {
    const actualAvailableRecallTypes = availableRecallTypes()

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })

  it(`all types are available when neither FTR nor Standard is mandatory`, () => {
    const actualAvailableRecallTypes = availableRecallTypes()

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })
})

describe('availableRecallTypesForRecommendation', () => {
  describe('Adult SDS sentence', () => {
    it('FTR mandatory -> only FTR and No Recall available', () => {
      ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(true)

      const actualAvailableRecallTypes = availableRecallTypesForRecommendation()

      expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
    })
  })

  describe('Youth SDS sentence', () => {
    it('FTR mandatory -> only FTR and No Recall available', () => {
      ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(true)

      const actualAvailableRecallTypes = availableRecallTypesForRecommendation()

      expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
    })
  })
})
