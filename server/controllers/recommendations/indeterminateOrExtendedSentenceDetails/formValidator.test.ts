import { validateAlternativesTried } from './formValidator'
import { formOptions } from '../helpers/formOptions'
import { cleanseUiList } from '../../../utils/lists'

describe('validateAlternativesTried', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'alternatives-tried',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/alternatives-tried`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      crn: 'X514364',
      alternativesToRecallTried: ['EXTRA_LICENCE_CONDITIONS', 'REFERRAL_TO_PARTNERSHIP_AGENCIES'],
      'alternativesToRecallTriedDetail-EXTRA_LICENCE_CONDITIONS': 'Info..',
      'alternativesToRecallTriedDetail-REFERRAL_TO_PARTNERSHIP_AGENCIES': 'Details for..',
    }
    const { errors, valuesToSave, nextPagePath } = await validateAlternativesTried({ requestBody, urlInfo })
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

  it('returns an error, if no checkbox is selected, and no valuesToSave', async () => {
    const requestBody = {
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateAlternativesTried({ requestBody, urlInfo })
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

  it('returns an error, if a selected checkbox is missing details, and no valuesToSave', async () => {
    const requestBody = {
      crn: 'X514364',
      alternativesToRecallTried: ['REFERRAL_TO_PARTNERSHIP_AGENCIES', 'REFERRAL_TO_APPROVED_PREMISES'],
      'alternativesToRecallTriedDetail-REFERRAL_TO_PARTNERSHIP_AGENCIES': 'Details',
      'alternativesToRecallTriedDetail-REFERRAL_TO_APPROVED_PREMISES': '',
    }
    const { errors, unsavedValues, valuesToSave } = await validateAlternativesTried({ requestBody, urlInfo })
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

  it('allows None to be selected without details required', async () => {
    const requestBody = {
      crn: 'X514364',
      alternativesToRecallTried: ['NONE'],
    }
    const { errors, valuesToSave } = await validateAlternativesTried({ requestBody, urlInfo })
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

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      alternativesToRecallTried: ['REFERRAL_TO_PARTNERSHIP_AGENCIES'],
      'alternativesToRecallTriedDetail-REFERRAL_TO_PARTNERSHIP_AGENCIES': 'Details',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }
    const { nextPagePath } = await validateAlternativesTried({
      requestBody,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-recommendation`)
  })
})
