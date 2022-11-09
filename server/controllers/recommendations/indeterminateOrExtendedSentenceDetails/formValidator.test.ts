import { validateIndeterminateDetails } from './formValidator'
import { formOptions } from '../formOptions/formOptions'
import { cleanseUiList } from '../../../utils/lists'

describe('validateIndeterminateDetails', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'indeterminate-details',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/indeterminate-details`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      crn: 'X514364',
      indeterminateOrExtendedSentenceDetails: ['BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE', 'OUT_OF_TOUCH'],
      'indeterminateOrExtendedSentenceDetailsDetail-BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE': 'Info..',
      'indeterminateOrExtendedSentenceDetailsDetail-OUT_OF_TOUCH': 'Details for..',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIndeterminateDetails({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      indeterminateOrExtendedSentenceDetails: {
        allOptions: cleanseUiList(formOptions.indeterminateOrExtendedSentenceDetails),
        selected: [
          {
            details: 'Info..',
            value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
          },
          {
            details: 'Details for..',
            value: 'OUT_OF_TOUCH',
          },
        ],
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/sensitive-info')
  })

  it('strips HTML tags out of details', async () => {
    const requestBody = {
      crn: 'X514364',
      indeterminateOrExtendedSentenceDetails: ['OUT_OF_TOUCH'],
      'indeterminateOrExtendedSentenceDetailsDetail-OUT_OF_TOUCH': '<br />Details for..',
    }
    const { valuesToSave } = await validateIndeterminateDetails({ requestBody, urlInfo })
    expect(valuesToSave).toEqual({
      indeterminateOrExtendedSentenceDetails: {
        allOptions: cleanseUiList(formOptions.indeterminateOrExtendedSentenceDetails),
        selected: [
          {
            details: 'Details for..',
            value: 'OUT_OF_TOUCH',
          },
        ],
      },
    })
  })

  it('returns an error, if no checkbox is selected, and no valuesToSave', async () => {
    const requestBody = {
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIndeterminateDetails({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#indeterminateOrExtendedSentenceDetails',
        name: 'indeterminateOrExtendedSentenceDetails',
        text: 'Select at least one of the criteria',
        errorId: 'noIndeterminateDetailsSelected',
      },
    ])
  })

  it('returns an error, if a selected checkbox is missing details, and no valuesToSave', async () => {
    const requestBody = {
      crn: 'X514364',
      indeterminateOrExtendedSentenceDetails: ['BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE', 'OUT_OF_TOUCH'],
      'indeterminateOrExtendedSentenceDetailsDetail-BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE': 'Info..',
      'indeterminateOrExtendedSentenceDetailsDetail-OUT_OF_TOUCH': ' ', // whitespace
    }
    const { errors, unsavedValues, valuesToSave } = await validateIndeterminateDetails({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      indeterminateOrExtendedSentenceDetails: [
        {
          details: 'Info..',
          value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
        },
        {
          details: ' ',
          value: 'OUT_OF_TOUCH',
        },
      ],
    })
    expect(errors).toEqual([
      {
        href: '#indeterminateOrExtendedSentenceDetailsDetail-OUT_OF_TOUCH',
        name: 'indeterminateOrExtendedSentenceDetailsDetail-OUT_OF_TOUCH',
        text: 'Enter details about {{ fullName }} being out of touch',
        errorId: 'missingIndeterminateDetail',
      },
    ])
  })

  it('allows None to be selected without details required', async () => {
    const requestBody = {
      crn: 'X514364',
      indeterminateOrExtendedSentenceDetails: ['NONE'],
    }
    const { errors, valuesToSave } = await validateIndeterminateDetails({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      indeterminateOrExtendedSentenceDetails: {
        allOptions: cleanseUiList(formOptions.indeterminateOrExtendedSentenceDetails),
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
      indeterminateOrExtendedSentenceDetails: ['OUT_OF_TOUCH'],
      'indeterminateOrExtendedSentenceDetailsDetail-OUT_OF_TOUCH': 'Details',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-circumstances' }
    const { nextPagePath } = await validateIndeterminateDetails({
      requestBody,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-circumstances`)
  })
})
