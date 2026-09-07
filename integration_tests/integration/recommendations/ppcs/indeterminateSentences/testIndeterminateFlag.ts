import CUSTODY_GROUP from '../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import RECOMMENDATION_STATUS from '../../../../../server/middleware/recommendationStatus'
import testInappropriateErrorPage from '../../../../componentTests/inappropriateErrorPage.tests'

const testIndeterminateFlag = (pageUnderTest: string) => {
  it('with ppcsIndeterminateJourney feature flag disabled', () => {
    const recommendation = RecommendationResponseGenerator.generate({
      bookRecallToPpud: {
        custodyGroup: CUSTODY_GROUP.INDETERMINATE,
      },
    })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: recommendation,
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(`/recommendations/${recommendation.id}/${pageUnderTest}?ppcsIndeterminateJourney=0`)

    testInappropriateErrorPage(recommendation.crn)
  })
}

export default testIndeterminateFlag
