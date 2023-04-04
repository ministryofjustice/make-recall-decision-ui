import { validateLicenceConditionsBreached } from './formValidator'
import { formOptions } from '../formOptions/formOptions'
import { cleanseUiList } from '../../../utils/lists'
import { getCaseSummary } from '../../../data/makeDecisionApiClient'
import caseApiResponse from '../../../../api/responses/get-case-licence-conditions.json'

jest.mock('../../../data/makeDecisionApiClient')

describe('validateLicenceConditionsBreached', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'licence-conditions',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/licence-conditions`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    ;(getCaseSummary as jest.Mock).mockResolvedValue(caseApiResponse)
    const requestBody = {
      crn: 'X514364',
      licenceConditionsBreached: ['standard|ADDRESS_APPROVED', 'additional|NLC9|NSTT9'],
      activeCustodialConvictionCount: '1',
    }
    const { errors, valuesToSave } = await validateLicenceConditionsBreached({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceConditionsBreached: {
        additionalLicenceConditions: {
          allOptions: [
            {
              details: 'Bespoke Condition (See Notes)',
              mainCatCode: 'NLC9',
              note: 'Must not enter Islington borough.',
              subCatCode: 'NSTT9',
              title: 'Supervision in the community',
            },
          ],
          selectedOptions: [{ mainCatCode: 'NLC9', subCatCode: 'NSTT9' }],
        },
        standardLicenceConditions: {
          allOptions: cleanseUiList(formOptions.standardLicenceConditions),
          selected: ['ADDRESS_APPROVED'],
        },
      },
      activeCustodialConvictionCount: 1,
    })
  })

  it('returns valuesToSave and no errors if nothing selected but PoP has multiple convictions', async () => {
    ;(getCaseSummary as jest.Mock).mockResolvedValue(caseApiResponse)
    const requestBody = {
      crn: 'X514364',
      activeCustodialConvictionCount: '2',
    }
    const { errors, valuesToSave } = await validateLicenceConditionsBreached({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      activeCustodialConvictionCount: 2,
    })
  })

  it('returns valuesToSave and no errors if nothing selected but PoP has no convictions', async () => {
    ;(getCaseSummary as jest.Mock).mockResolvedValue(caseApiResponse)
    const requestBody = {
      crn: 'X514364',
      activeCustodialConvictionCount: '0',
    }
    const { errors, valuesToSave } = await validateLicenceConditionsBreached({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      activeCustodialConvictionCount: 0,
    })
  })

  it('returns an error if nothing selected, and PoP has 1 conviction', async () => {
    const requestBody = {
      crn: 'X514364',
      activeCustodialConvictionCount: '1',
    }
    const { errors, valuesToSave, nextPagePath } = await validateLicenceConditionsBreached({
      requestBody,
      urlInfo,
    })
    expect(errors).toEqual([
      {
        errorId: 'noLicenceConditionsSelected',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'You must select one or more licence conditions',
      },
    ])
    expect(valuesToSave).toBeUndefined()
    expect(nextPagePath).toBeUndefined()
  })

  it('returns an error if invalid standard condition sent', async () => {
    const requestBody = {
      crn: 'X514364',
      licenceConditionsBreached: 'standard|BANANA',
      activeCustodialConvictionCount: '1',
    }
    const { errors, valuesToSave, nextPagePath } = await validateLicenceConditionsBreached({
      requestBody,
      urlInfo,
    })
    expect(errors).toEqual([
      {
        errorId: 'noLicenceConditionsSelected',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'You must select one or more licence conditions',
      },
    ])
    expect(valuesToSave).toBeUndefined()
    expect(nextPagePath).toBeUndefined()
  })

  it('returns an error if CRN is restricted', async () => {
    ;(getCaseSummary as jest.Mock).mockResolvedValue({
      userAccessResponse: {
        userRestricted: true,
      },
    })
    const requestBody = {
      crn: 'X514364',
      licenceConditionsBreached: 'additional|NST30',
      activeCustodialConvictionCount: '1',
    }
    const { errors, valuesToSave, nextPagePath } = await validateLicenceConditionsBreached({
      requestBody,
      urlInfo,
    })
    expect(errors).toEqual([
      {
        errorId: 'excludedRestrictedCrn',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'This CRN is excluded or restricted',
      },
    ])
    expect(valuesToSave).toBeUndefined()
    expect(nextPagePath).toBeUndefined()
  })

  it('returns an error if the case has multiple active custodial convictions', async () => {
    ;(getCaseSummary as jest.Mock).mockResolvedValue({
      activeConvictions: [
        {
          sentence: {
            isCustodial: true,
            licenceExpiryDate: '2023-06-16',
            sentenceExpiryDate: '2021-11-23',
          },
        },
        {
          sentence: {
            isCustodial: true,
            licenceExpiryDate: '2021-03-24',
          },
        },
      ],
    })
    const requestBody = {
      crn: 'X514364',
      licenceConditionsBreached: 'additional|NST30',
      activeCustodialConvictionCount: '2',
    }
    const { errors, valuesToSave, nextPagePath } = await validateLicenceConditionsBreached({
      requestBody,
      urlInfo,
    })
    expect(errors).toEqual([
      {
        errorId: 'hasMultipleActiveCustodial',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'This person has multiple active custodial convictions',
      },
    ])
    expect(valuesToSave).toBeUndefined()
    expect(nextPagePath).toBeUndefined()
  })

  it('returns an error if the case has no active custodial convictions', async () => {
    ;(getCaseSummary as jest.Mock).mockResolvedValue({
      activeConvictions: [],
    })
    const requestBody = {
      crn: 'X514364',
      licenceConditionsBreached: 'additional|NST30',
      activeCustodialConvictionCount: '0',
    }
    const { errors, valuesToSave, nextPagePath } = await validateLicenceConditionsBreached({
      requestBody,
      urlInfo,
    })
    expect(errors).toEqual([
      {
        errorId: 'noActiveCustodial',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'This person has no active custodial convictions',
      },
    ])
    expect(valuesToSave).toBeUndefined()
    expect(nextPagePath).toBeUndefined()
  })
})
