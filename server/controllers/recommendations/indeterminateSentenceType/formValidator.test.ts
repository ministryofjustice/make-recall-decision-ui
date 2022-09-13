import { validateIndeterminateSentenceType } from './formValidator'
import { formOptions } from '../helpers/formOptions'
import { validateCustodyStatus } from '../custodyStatus/formValidator'

describe('validateVictimContactScheme', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'indeterminate-type',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/indeterminate-type`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      indeterminateSentenceType: 'LIFE',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIndeterminateSentenceType({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      indeterminateSentenceType: {
        allOptions: formOptions.indeterminateSentenceType,
        selected: 'LIFE',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/recall-type')
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      custodyStatus: 'YES_PRISON',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-custody' }
    const { nextPagePath } = await validateCustodyStatus({
      requestBody,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-custody`)
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      indeterminateSentenceType: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIndeterminateSentenceType({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#indeterminateSentenceType',
        name: 'indeterminateSentenceType',
        text: 'Select whether {{ fullName }} is on a life, IPP or DPP sentence',
        errorId: 'noIndeterminateSentenceTypeSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      indeterminateSentenceType: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIndeterminateSentenceType({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#indeterminateSentenceType',
        name: 'indeterminateSentenceType',
        text: 'Select whether {{ fullName }} is on a life, IPP or DPP sentence',
        errorId: 'noIndeterminateSentenceTypeSelected',
      },
    ])
  })
})
