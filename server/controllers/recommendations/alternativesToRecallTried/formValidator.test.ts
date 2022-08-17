import { validateAlternativesTried } from './formValidator'
import { formOptions } from '../helpers/formOptions'
import { cleanseUiList } from '../../../utils/lists'

describe('validateAlternativesTried', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', () => {
    const requestBody = {
      crn: 'X514364',
      alternativesToRecallTried: ['EXTRA_LICENCE_CONDITIONS', 'REFERRAL_TO_PARTNERSHIP_AGENCIES'],
      'alternativesToRecallTriedDetail-EXTRA_LICENCE_CONDITIONS': 'Info..',
      'alternativesToRecallTriedDetail-REFERRAL_TO_PARTNERSHIP_AGENCIES': 'Details for..',
    }
    const { errors, valuesToSave, nextPagePath } = validateAlternativesTried({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      alternativesToRecallTried: {
        allOptions: cleanseUiList(formOptions.alternativesToRecallTried),
        selected: [
          {
            details: 'Info..',
            value: 'EXTRA_LICENCE_CONDITIONS',
          },
          {
            details: 'Details for..',
            value: 'REFERRAL_TO_PARTNERSHIP_AGENCIES',
          },
        ],
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/stop-think')
  })

  it('returns an error, if no checkbox is selected, and no valuesToSave', () => {
    const requestBody = {
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateAlternativesTried({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#alternativesToRecallTried',
        name: 'alternativesToRecallTried',
        text: 'You must select which alternatives to recall have been tried already',
        errorId: 'noAlternativesTriedSelected',
      },
    ])
  })

  it('returns an error, if a selected checkbox is missing details, and no valuesToSave', () => {
    const requestBody = {
      _csrf: 'vbnnvrf3-byah2Sg8rc4Sx68ypC8JxJtrync',
      crn: 'X514364',
      alternativesToRecallTried: ['REFERRAL_TO_PARTNERSHIP_AGENCIES', 'REFERRAL_TO_APPROVED_PREMISES'],
      'alternativesToRecallTriedDetail-REFERRAL_TO_PARTNERSHIP_AGENCIES': 'Details',
      'alternativesToRecallTriedDetail-REFERRAL_TO_APPROVED_PREMISES': '',
    }
    const { errors, unsavedValues, valuesToSave } = validateAlternativesTried({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      alternativesToRecallTried: [
        {
          details: 'Details',
          value: 'REFERRAL_TO_PARTNERSHIP_AGENCIES',
        },
        {
          details: '',
          value: 'REFERRAL_TO_APPROVED_PREMISES',
        },
      ],
    })
    expect(errors).toEqual([
      {
        href: '#alternativesToRecallTriedDetail-REFERRAL_TO_APPROVED_PREMISES',
        name: 'alternativesToRecallTriedDetail-REFERRAL_TO_APPROVED_PREMISES',
        text: 'Enter more detail for referral to approved premises',
        errorId: 'missingAlternativesTriedDetail',
      },
    ])
  })

  it('allows None to be selected without details required', () => {
    const requestBody = {
      crn: 'X514364',
      alternativesToRecallTried: ['NONE'],
    }
    const { errors, valuesToSave } = validateAlternativesTried({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      alternativesToRecallTried: {
        allOptions: cleanseUiList(formOptions.alternativesToRecallTried),
        selected: [
          {
            value: 'NONE',
          },
        ],
      },
    })
  })
})
