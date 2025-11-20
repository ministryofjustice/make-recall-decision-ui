import { randomUUID } from 'node:crypto'
import { randomInt } from 'crypto'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import {
  getDeterminateSentences,
  groupSentencesByCourtAndDate,
  CourtGroup,
} from '../../../../helpers/ppudSentence/ppudSentenceHelper'
import { PpudDetailsSentence } from '../../../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { ppudDetailsSentence } from '../../../../@types/make-recall-decision-api/models/ppud/PpudDetailsResponse.testFactory'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import determinateSentenceDetailsController from './determinateSentenceDetailsController'

jest.mock('../../../../data/makeDecisionApiClient')
jest.mock('../../../../helpers/ppudSentence/ppudSentenceHelper')
jest.mock('../../../../utils/errors')

describe('get', () => {
  it('load sentences as expected', async () => {
    const sentenceId = faker.number.int().toString()
    const recommendation = RecommendationResponseGenerator.generate({
      ppudOffender: {
        sentences: [{ id: sentenceId, custodyType: 'EDS' }, { custodyType: 'EPP' }],
      },
    })

    const res = mockRes({
      locals: {
        user: {
          token: randomUUID(),
        },
        recommendation,
      },
    })
    const req = mockReq({
      params: {
        recommendationId: randomInt(0, 10000).toString(),
      },
    })
    const determinateSentences: PpudDetailsSentence[] = [
      ppudDetailsSentence({ custodyType: 'EDS', dateOfSentence: new Date(2020, 1, 1) }),
      ppudDetailsSentence({ custodyType: 'EPP', dateOfSentence: new Date(2020, 1, 2) }),
    ]
    const next = mockNext()

    ;(getDeterminateSentences as jest.Mock).mockReturnValueOnce(determinateSentences)

    const groupedSentences: CourtGroup[] = [
      { court: 'London', sentencesByDate: [{ dateOfSentence: '01-01-2020', sentences: [ppudDetailsSentence()] }] },
      { court: 'Brighton', sentencesByDate: [{ dateOfSentence: '02-01-2020', sentences: [ppudDetailsSentence()] }] },
    ]
    ;(groupSentencesByCourtAndDate as jest.Mock).mockReturnValue(groupedSentences)

    const determinateSentencesByCourt = groupSentencesByCourtAndDate(determinateSentences)
    const expectedPageData = {
      determinateSentencesByCourt,
      fullName: recommendation.personOnProbation.name,
    }

    // when
    await determinateSentenceDetailsController.get(req, res, next)

    // then
    expect(res.locals.page.id).toEqual('determinatePpudSentences')
    expect(res.locals.determinatePpudSentencesPageData).toEqual(expectedPageData)
    expect(res.locals.recommendation).toEqual(recommendation)

    expect(getDeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcs/determinateSentence/determinatePpudSentences')
    expect(next).toHaveBeenCalled()
  })
})
