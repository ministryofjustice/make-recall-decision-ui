import { fakerEN_GB as faker } from '@faker-js/faker'
import { SentenceGroup } from './formOptions'
import { UrlInfoGenerator } from '../../../../data/common/urlInfoGenerator'
import validateSentenceInformation from './formValidator'
import { makeErrorObject } from '../../../utils/errors'
import { nextPageLinkUrl } from '../helpers/urls'
import NamedFormErrorGenerator from '../../../../data/common/errorGenerator'
import randomEnum from '../../../@types/enum.testFactory'
import ppPaths from '../../../routes/paths/pp'

jest.mock('../../../utils/errors')
jest.mock('../helpers/urls')

describe('validateSentenceInformation', () => {
  const testCasesForValidValues = [
    {
      description: 'valid non-indeterminate sentence group',
      sentenceGroup: randomEnum(SentenceGroup, [SentenceGroup.INDETERMINATE]),
      nextPageId: ppPaths.taskListConsiderRecall,
    },
    {
      description: 'valid indeterminate sentence group',
      sentenceGroup: SentenceGroup.INDETERMINATE,
      nextPageId: ppPaths.indeterminateSentenceType,
    },
  ]
  testCasesForValidValues.forEach(testCase => {
    it(`should return valuesToSave and no errors if ${testCase.description}`, async () => {
      const requestBody = {
        sentenceGroup: testCase.sentenceGroup,
      }
      const urlInfo = UrlInfoGenerator.generate()

      const expectedNextPagePath = faker.internet.url()
      ;(nextPageLinkUrl as jest.Mock).mockReturnValue(expectedNextPagePath)

      const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateSentenceInformation({
        requestBody,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(unsavedValues).toBeUndefined()
      expect(valuesToSave).toEqual({
        sentenceGroup: requestBody.sentenceGroup,
      })
      expect(nextPagePath).toEqual(expectedNextPagePath)
      expect(nextPageLinkUrl).toHaveBeenCalledWith({
        urlInfo,
        nextPageId: testCase.nextPageId,
      })
    })
  })

  it('should return an error if sentenceGroup is not set', async () => {
    const urlInfo = UrlInfoGenerator.generate()

    const expectedError = NamedFormErrorGenerator.generate()
    ;(makeErrorObject as jest.Mock).mockReturnValue(expectedError)

    const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateSentenceInformation({
      requestBody: {},
      urlInfo,
    })

    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([expectedError])
    expect(unsavedValues).toEqual({})
    expect(nextPagePath).toBeUndefined()

    expect(makeErrorObject).toHaveBeenCalledWith({
      id: 'sentenceGroup',
      text: 'Select a sentence group',
      errorId: 'missingSentenceGroup',
    })
  })

  it('should return an error if invalid sentenceGroup is set', async () => {
    const requestBody = {
      sentenceGroup: faker.lorem.word(),
    }
    const urlInfo = UrlInfoGenerator.generate()

    const expectedError = NamedFormErrorGenerator.generate()
    ;(makeErrorObject as jest.Mock).mockReturnValue(expectedError)

    const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateSentenceInformation({
      requestBody,
      urlInfo,
    })

    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([expectedError])
    expect(unsavedValues).toEqual({ sentenceGroup: requestBody.sentenceGroup })
    expect(nextPagePath).toBeUndefined()

    expect(makeErrorObject).toHaveBeenCalledWith({
      id: 'sentenceGroup',
      text: 'Select a sentence group',
      errorId: 'missingSentenceGroup',
    })
  })
})
