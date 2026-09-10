import completeRecommendationResponse from '../../../../../api/responses/get-recommendation.json'
import RECOMMENDATION_STATUS from '../../../../../server/middleware/recommendationStatus'
import CUSTODY_GROUP from '../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { SentenceGroup } from '../../../../../server/controllers/recommendations/sentenceInformation/formOptions'
import ppcsPaths from '../../../../../server/routes/paths/ppcs.paths'
import setUpSessionForPpcs from '../util'
import testIndeterminateFlag from './testIndeterminateFlag'

context('Select Indeterminate PPUD Sentence', () => {
  const testPageUrl = `/recommendations/252523937/${ppcsPaths.selectIndeterminatePpudSentence}?ppcsIndeterminateJourney=1`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  testIndeterminateFlag(ppcsPaths.selectIndeterminatePpudSentence)

  // TODO the tests below were copied over from recommendation.spec.ts. They follow the old approach of using
  //      completeRecommendationResponse as the base response, which isn't ideal. Should be changed to use
  //      RecommendationResponseGenerator at some point
  it('select indeterminate ppud sentence', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...completeRecommendationResponse,
        sentenceGroup: SentenceGroup.INDETERMINATE,
        bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
        ppudOffender: {
          id: '1',
          sentences: [
            {
              id: '1',
              dateOfSentence: '2003-06-12',
              custodyType: 'Mandatory (MLP)',
              licenceExpiryDate: null,
              mappaLevel: 'Level 2 – Local Inter-Agency Management',
              offence: {
                indexOffence: 'some offence',
                dateOfIndexOffence: null,
              },
              sentenceExpiryDate: '1969-03-02',
              tariffExpiryDate: '1970-03-02',
            },
          ],
        },
        convictionDetail: {
          indexOffenceDescription: 'Burglary',
          sentenceExpiryDate: '2024-05-10',
          dateOfSentence: '2022-03-11',
        },
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(testPageUrl)
    cy.pageHeading().should('contain', 'Select a sentence for your booking')

    cy.get('div[id=nomis-sentence-details-offence-row] dd').should('contain.text', 'Burglary')
    cy.get('div[id=nomis-sentence-details-date-of-sentence-row] dd').should('contain.text', '11 March 2022')
    cy.get('div[id=nomis-sentence-details-sentence-type-row] dd').should('contain.text', CUSTODY_GROUP.INDETERMINATE)
    cy.get('div[id=nomis-sentence-details-sentence-expiry-date-row] dd').should('contain.text', '10 May 2024')

    cy.get('div[id=1-offence-row] dd').should('contain.text', 'some offence')
    cy.get('div[id=1-custody-type-row] dd').should('contain.text', 'Mandatory (MLP)')
    cy.get('div[id=1-date-of-sentence-row] dd').should('contain.text', '12 June 2003')
    cy.get('div[id=1-tariff-expiry-date-row] dd').should('contain.text', '2 March 1970')

    cy.get('h2').should('have.class', 'govuk-heading-m').should('contain.text', 'Add your booking to PPUD')
    cy.get('p.govuk-body')
      .contains(
        'Select the sentence for this booking. If the correct sentence is not listed, it needs to be added to PPUD.',
      )
      .should('exist')
    // check the determinate sentence content is not present
    cy.get('#determinateSentencesDetails').should('not.exist')
  })

  it('select indeterminate ppud sentence - show determinate sentence details', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...completeRecommendationResponse,
        sentenceGroup: SentenceGroup.INDETERMINATE,
        bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
        ppudOffender: {
          id: '1',
          sentences: [
            {
              id: '1',
              dateOfSentence: '2003-06-12',
              custodyType: 'Mandatory (MLP)',
              licenceExpiryDate: null,
              mappaLevel: 'Level 2 – Local Inter-Agency Management',
              offence: {
                indexOffence: 'some offence',
                dateOfIndexOffence: null,
              },
              sentenceExpiryDate: '1969-03-02',
            },
            {
              id: '2',
              dateOfSentence: '2004-06-12',
              custodyType: 'Determinate', // determinate sentences
              licenceExpiryDate: null,
              mappaLevel: 'Level 2 – Local Inter-Agency Management',
              offence: {
                indexOffence: 'some offence',
                dateOfIndexOffence: null,
              },
              sentenceExpiryDate: '1969-03-02',
            },
            {
              id: '3',
              dateOfSentence: '2004-06-12',
              custodyType: 'EDS', // determinate sentences
              licenceExpiryDate: null,
              mappaLevel: 'Level 2 – Local Inter-Agency Management',
              offence: {
                indexOffence: 'another offence',
                dateOfIndexOffence: null,
              },
              sentenceExpiryDate: '1969-03-02',
            },
          ],
        },
        convictionDetail: {
          indexOffenceDescription: 'Burglary',
          sentenceExpiryDate: '2024-05-10',
          dateOfSentence: '2022-03-11',
        },
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(testPageUrl)
    cy.pageHeading().should('contain', 'Select a sentence for your booking')
    cy.get('#determinateSentencesDetails')
      .find('.govuk-details__summary-text')
      .should('contain.text', '2 determinate sentences')

    cy.get('#determinateSentencesDetails')
      .find('.govuk-details__text')
      .should('contain.text', 'You can view the determinate sentences for Jane Bloggs')
  })

  it('select indeterminate ppud sentence - show notification banner when there are no indeterminate sentences', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...completeRecommendationResponse,
        sentenceGroup: SentenceGroup.INDETERMINATE,
        bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
        ppudOffender: {
          id: '1',
          sentences: [],
        },
        convictionDetail: {
          indexOffenceDescription: 'Burglary',
          sentenceExpiryDate: '2024-05-10',
          dateOfSentence: '2022-03-11',
        },
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(testPageUrl)
    cy.pageHeading().should('contain', 'Select a sentence for your booking')

    cy.get('#govuk-notification-banner-title').should('contain.text', 'No indeterminate sentences found in PPUD')
    cy.get('.govuk-notification-banner__content').should(
      'contain.text',
      'The sentence needs to be added to PPUD and the booking on completed there.',
    )

    cy.get('#return-to-booking-details-button')
      .should('have.attr', 'href', '/recommendations/1/check-booking-details')
      .invoke('text')
      .then(text => {
        const normalized = text.replace(/\s+/g, ' ').trim()
        expect(normalized).to.eq('Return to booking details')
      })
  })
})
