import { fakerEN_GB as faker } from '@faker-js/faker'
import searchMappedUserResponse from '../../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../../api/responses/ppudSearchActiveUsers.json'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import { RECOMMENDATION_STATUS } from '../../../../../server/middleware/recommendationStatus'
import { SummaryList, testSummaryList } from '../../../../componentTests/summaryList.tests'
import { formatPpudSentenceLength } from '../../../../../server/utils/dates/ppudSentenceLength/formatting'
import { ppcsPaths } from '../../../../../server/routes/paths/ppcs'
import { formatDateTimeFromIsoString } from '../../../../../server/utils/dates/formatting'

describe('Indeterminate sentence - Your recall booking page', () => {
  context('When viewing the sentence data', () => {
    // Log in as PPCS user
    beforeEach(() => {
      cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
    })

    const recommendationId = '123'
    const testPageUrl = `/recommendations/${recommendationId}/sentence-to-commit-indeterminate`

    const sentenceId = faker.number.int().toString()
    const releaseDate = faker.date.future()

    const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

    context("and the sentence data hasn't been edited", () => {
      const defaultRecommendationResponse = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyType: 'IPP',
          ppudSentenceId: sentenceId,
        },
        ppudOffender: {
          sentences: [{ id: sentenceId, custodyType: 'IPP', releaseDate }],
        },
      })
      const ppudSentence = defaultRecommendationResponse.ppudOffender.sentences.find(
        s => s.id === defaultRecommendationResponse.bookRecallToPpud.ppudSentenceId
      )
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })
      it('displays the default recommendation data', () => {
        const summaryListContent = {
          rows: [
            { key: 'Custody type', value: defaultRecommendationResponse.bookRecallToPpud.custodyType },
            {
              key: 'Offence',
              value: ppudSentence.offence.indexOffence,
              editLink: { url: '#', accessibleLabel: 'offence' },
            },
            {
              key: 'Release date',
              value: formatDateTimeFromIsoString({ isoDate: releaseDate.toISOString() }),
              editLink: { url: ppcsPaths.indeterminateEdit.releaseDate, accessibleLabel: 'release date' },
            },
            {
              key: 'Sentencing court',
              value: ppudSentence.sentencingCourt,
              editLink: { url: '#', accessibleLabel: 'sentencing court' },
            },
            {
              key: 'Date of sentence',
              value: formatDateTimeFromIsoString({ isoDate: ppudSentence.dateOfSentence }),
              editLink: { url: '#', accessibleLabel: 'date of sentence' },
            },
            {
              key: 'Tariff expiry date',
              value: formatDateTimeFromIsoString({ isoDate: ppudSentence.sentenceExpiryDate }),
            },
            { key: 'Full punishment', value: formatPpudSentenceLength(ppudSentence.sentenceLength) },
          ],
          matchLength: true,
        }
        checkRecallBookingPageContent(
          testPageUrl,
          defaultRecommendationResponse.personOnProbation.name,
          summaryListContent
        )
      })
    })
    context('and the sentence data has been edited', () => {
      const editedReleaseDate = faker.date.future()
      const editedOffenceDescription = faker.lorem.sentence()
      const editedDateOfSentence = faker.date.past()
      const editedSentencingCourt = `${faker.location.city()} Court`
      const editedRecommendationResponse = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyType: 'IPP',
          ppudSentenceId: sentenceId,
          ppudIndeterminateSentenceData: {
            offenceDescription: editedOffenceDescription,
            releaseDate: editedReleaseDate,
            sentencingCourt: editedSentencingCourt,
            dateOfSentence: editedDateOfSentence,
          },
        },
        ppudOffender: {
          sentences: [{ id: sentenceId, custodyType: 'IPP', releaseDate }],
        },
      })
      const ppudSentence = editedRecommendationResponse.ppudOffender.sentences.find(
        s => s.id === editedRecommendationResponse.bookRecallToPpud.ppudSentenceId
      )
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: editedRecommendationResponse })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })
      it('shows the updated data for the edited fields', () => {
        const editedSentenceData = editedRecommendationResponse.bookRecallToPpud.ppudIndeterminateSentenceData
        const summaryListContent = {
          rows: [
            { key: 'Custody type', value: editedRecommendationResponse.bookRecallToPpud.custodyType },
            {
              key: 'Offence',
              value: editedSentenceData.offenceDescription,
              editLink: { url: '#', accessibleLabel: 'offence' },
            },
            {
              key: 'Release date',
              value: formatDateTimeFromIsoString({ isoDate: editedSentenceData.releaseDate }),
              editLink: { url: ppcsPaths.indeterminateEdit.releaseDate, accessibleLabel: 'release date' },
            },
            {
              key: 'Sentencing court',
              value: editedSentenceData.sentencingCourt,
              editLink: { url: '#', accessibleLabel: 'sentencing court' },
            },
            {
              key: 'Date of sentence',
              value: formatDateTimeFromIsoString({ isoDate: editedSentenceData.dateOfSentence }),
              editLink: { url: '#', accessibleLabel: 'date of sentence' },
            },
            {
              key: 'Tariff expiry date',
              value: formatDateTimeFromIsoString({ isoDate: ppudSentence.sentenceExpiryDate }),
            },
            { key: 'Full punishment', value: formatPpudSentenceLength(ppudSentence.sentenceLength) },
          ],
          matchLength: true,
        }
        checkRecallBookingPageContent(
          testPageUrl,
          editedRecommendationResponse.personOnProbation.name,
          summaryListContent
        )
      })
    })
  })
})

function checkRecallBookingPageContent(testPageUrl: string, popName: string, summaryListContent: SummaryList) {
  cy.visit(testPageUrl)

  cy.pageHeading().should('contain', `Your recall booking for ${popName}`)
  cy.get('.govuk-body').should(
    'contain.text',
    "This is the sentence you've selected from PPUD. You can edit anything that's wrong. This will update what's in PPUD."
  )

  cy.get('h2').should('have.class', 'govuk-heading-m').should('contain.text', 'Your recall booking')

  // Check that the summary list exists and is populated
  cy.get('dl').should('have.class', 'govuk-summary-list').should('exist').as('sentenceSummary')
  testSummaryList(cy.get('@sentenceSummary'), summaryListContent)

  cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
}
