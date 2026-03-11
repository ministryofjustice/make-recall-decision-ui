import { faker } from '@faker-js/faker/locale/en_GB'
import inputDisplayValuesSentenceInformation from '../recommendations/sentenceInformation/inputDisplayValues'
import sentenceGroup, { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import sentenceInformationController from './sentenceInformationController'
import { UrlInfoGenerator } from '../../../data/common/urlInfoGenerator'
import validateSentenceInformation from '../recommendations/sentenceInformation/formValidator'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import ErrorGenerator from '../../../data/common/errorGenerator'
import ppPaths from '../../routes/paths/pp'
import { CaseSummaryOverviewResponseGenerator } from '../../../data/caseSummary/overview/caseSummaryOverviewResponseGenerator'
import getCaseSection from '../caseSummary/getCaseSection'
import { renderString } from '../../utils/nunjucks'

jest.mock('../recommendations/sentenceInformation/inputDisplayValues')
jest.mock('../recommendations/sentenceInformation/formValidator')
jest.mock('../../data/makeDecisionApiClient')
jest.mock('../caseSummary/getCaseSection')

describe('Sentence Information Controller', () => {
  it('get', async () => {
    const recommendation = RecommendationResponseGenerator.generate()
    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const req = mockReq()
    const next = mockNext()

    const expectedCaseSummary = CaseSummaryOverviewResponseGenerator.generate()
    ;(getCaseSection as jest.Mock).mockResolvedValue({ caseSummary: expectedCaseSummary })

    const stringRenderParams = {
      fullName: recommendation.personOnProbation.name,
    }
    const expectedSentenceGroups = sentenceGroup.map(group => {
      return {
        text: group.text,
        value: group.value,
        hint: group.detailsLabel ? { text: renderString(group.detailsLabel, stringRenderParams) } : undefined,
      }
    })

    const expectedInputDisplayValues = {
      value: faker.helpers.enumValue(SentenceGroup),
    }
    ;(inputDisplayValuesSentenceInformation as jest.Mock).mockReturnValue(expectedInputDisplayValues)

    await sentenceInformationController.get(req, res, next)

    expect(res.locals.pageData.page).toEqual({ id: 'sentenceInformation' })
    expect(res.locals.pageData.caseSummary).toEqual(expectedCaseSummary)
    expect(getCaseSection).toHaveBeenCalledWith(
      'overview',
      recommendation.crn,
      res.locals.user.token,
      res.locals.user.userId,
      req.query,
      res.locals.flags,
    )
    expect(res.locals.pageData.sentenceGroups).toEqual(expectedSentenceGroups)
    expect(res.locals.pageData.fullName).toEqual(recommendation.personOnProbation.name)
    expect(res.locals.pageData.inputDisplayValues).toEqual(expectedInputDisplayValues)
    expect(inputDisplayValuesSentenceInformation).toHaveBeenCalledWith({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    })
    expect(res.locals.pageData.backLinkUrl).toEqual(`${res.locals.urlInfo.basePath}${ppPaths.taskListConsiderRecall}`)
  })

  describe('post', () => {
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        sentenceGroup: faker.helpers.enumValue(SentenceGroup),
      },
    })
    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: RecommendationResponseGenerator.generate(),
        urlInfo: UrlInfoGenerator.generate(),
      },
    })
    const next = mockNext()

    it('post with valid data', async () => {
      const validationResults = {
        valuesToSave: { sentenceGroup: req.body.sentenceGroup },
        nextPagePath: faker.internet.url(),
      }
      ;(validateSentenceInformation as jest.Mock).mockReturnValue(validationResults)
      ;(updateRecommendation as jest.Mock).mockReturnValue({})

      await sentenceInformationController.post(req, res, next)

      expect(validateSentenceInformation).toHaveBeenCalledWith({
        requestBody: req.body,
        recommendationId: req.params.recommendationId,
        urlInfo: res.locals.urlInfo,
        token: res.locals.user.token,
      })

      expect(updateRecommendation).toHaveBeenCalledWith({
        recommendationId: req.params.recommendationId,
        token: res.locals.user.token,
        valuesToSave: validationResults.valuesToSave,
        featureFlags: {},
      })

      expect(res.redirect).toHaveBeenCalledWith(303, validationResults.nextPagePath)
      expect(next).not.toHaveBeenCalled() // end of the line for posts.
    })

    it('post with invalid data', async () => {
      const validationResults = {
        errors: ErrorGenerator.generate(),
        unsavedValues: { sentenceGroup: faker.helpers.enumValue(SentenceGroup) },
      }
      ;(validateSentenceInformation as jest.Mock).mockReturnValue(validationResults)
      ;(updateRecommendation as jest.Mock).mockReturnValue({})

      await sentenceInformationController.post(req, res, next)

      expect(validateSentenceInformation).toHaveBeenCalledWith({
        requestBody: req.body,
        recommendationId: req.params.recommendationId,
        urlInfo: res.locals.urlInfo,
        token: res.locals.user.token,
      })

      expect(updateRecommendation).not.toHaveBeenCalled()

      expect(req.session).toEqual({
        errors: validationResults.errors,
        unsavedValues: validationResults.unsavedValues,
      })
      expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
      expect(next).not.toHaveBeenCalled() // end of the line for posts.
    })
  })
})
