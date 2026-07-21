import { fakerEN_GB as faker } from '@faker-js/faker'
import routes from '../../../../../api/routes'
import setUpSessionForPpcs from '../util'
import RECOMMENDATION_STATUS from '../../../../../server/middleware/recommendationStatus'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import CUSTODY_GROUP from '../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { testSummaryList } from '../../../../componentTests/summaryList.tests'
import { indeterminateCustodyTypes } from '../../../../../server/helpers/ppudSentence/custodyTypes'
import { formatDateTimeFromIsoString } from '../../../../../server/utils/dates/formatting'

context('Indeterminate Sentence - Booking Summary Page', () => {
  const recommendationId = '123'
  const testPageUrl = `${routes.recommendations}/${recommendationId}/booking-summary`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  describe('Page Data', () => {
    describe('initial page load', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.INDETERMINATE,
        },
        ppudOffender: {
          sentences: faker.helpers
            .multiple(() => faker.helpers.arrayElement(indeterminateCustodyTypes))
            .map(indeterminateCustodyType => ({
              custodyType: indeterminateCustodyType,
              sentenceLength: {
                partYears: faker.number.int({ min: 0, max: 10 }),
              },
            })),
        },
      })

      const selectedPpudSentence = faker.helpers.arrayElement(recommendation.ppudOffender.sentences)
      recommendation.bookRecallToPpud.ppudSentenceId = selectedPpudSentence.id

      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })

      it('displays the page heading and body', () => {
        cy.visit(testPageUrl)

        cy.pageHeading().should(
          'contain',
          `Booking summary for ${recommendation.bookRecallToPpud.firstNames} ${recommendation.bookRecallToPpud.lastName}`,
        )
        cy.get('.govuk-body')
          .first()
          .should(
            'contain.text',
            'Check the information you tried to send to PPUD against what’s there. You may have to add some information directly into PPUD.',
          )
        cy.get('a.govuk-link').should('contain.text', 'Go to PPUD (opens in new tab)')
      })

      it('Go to PPUD takes to Check booking details', () => {
        cy.visit(testPageUrl)

        cy.clickLink('Go to PPUD (opens in new tab)')
        cy.get('h1').contains('Check booking details')
      })

      describe('Sentence section', () => {
        it('displays the Sentence heading and hint', () => {
          cy.visit(testPageUrl)
          cy.get('h2').first().should('contain.text', 'Sentence')
          cy.get('.govuk-hint').first().should('contain.text', 'Selected for recall.')
        })

        it('displays all sentence summary list fields - INDETERMINATE', () => {
          const recWithOffence = RecommendationResponseGenerator.generate({
            bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.INDETERMINATE },
          })

          const offence = recWithOffence.nomisIndexOffence?.allOptions?.find(
            o => o.offenderChargeId === recWithOffence.nomisIndexOffence?.selected,
          )

          offence.courtDescription = 'Birmingham'
          offence.offenceDate = faker.date.past().toISOString()
          offence.releaseDate = faker.date.future().toISOString()
          offence.sentenceDate = faker.date.past().toISOString()
          offence.licenceExpiryDate = faker.date.future().toISOString()
          offence.sentenceEndDate = faker.date.future().toISOString()
          offence.terms = [
            {
              years: 2,
              months: 2,
              days: 3,
              weeks: 2,
              code: 'T1',
            },
          ]
          const expectedSentenceLength = `${offence.terms[0].years} years, ${offence.terms[0].months} months, ${offence.terms[0].weeks} weeks, ${offence?.terms[0].days} days`

          cy.task('getRecommendation', { statusCode: 200, response: recWithOffence })
          cy.visit(testPageUrl)

          cy.get('#indeterminate-sentence').as('summaryList')

          cy.get('@summaryList').then($summaryList => {
            testSummaryList(cy.wrap($summaryList), {
              rows: [
                {
                  key: 'Offence',
                  value: recommendation.bookRecallToPpud.indexOffence ?? '- no value',
                },
                {
                  key: 'Offence date',
                  value: formatDateTimeFromIsoString({ isoDate: offence.offenceDate }),
                },
                {
                  key: 'Release date',
                  value: formatDateTimeFromIsoString({ isoDate: offence.releaseDate }),
                },
                {
                  key: 'Sentencing court',
                  value: offence.courtDescription,
                },
                {
                  key: 'Date of sentence',
                  value: formatDateTimeFromIsoString({ isoDate: offence.sentenceDate }),
                },
                {
                  key: 'Tariff expiry date',
                  value: formatDateTimeFromIsoString({ isoDate: offence.licenceExpiryDate }),
                },
                {
                  key: 'Full punishment',
                  value: expectedSentenceLength,
                },
              ],
            })
          })
        })

        it('displays all sentence summary list fields - DETERMINATE', () => {
          const recWithOffence = RecommendationResponseGenerator.generate({
            bookRecallToPpud: {
              custodyGroup: CUSTODY_GROUP.DETERMINATE,
            },
          })

          const offence = recWithOffence.nomisIndexOffence?.allOptions?.find(
            o => o.offenderChargeId === recWithOffence.nomisIndexOffence?.selected,
          )

          offence.courtDescription = 'Birmingham'
          offence.offenceDate = faker.date.past().toISOString()
          offence.releaseDate = faker.date.future().toISOString()
          offence.sentenceDate = faker.date.past().toISOString()
          offence.licenceExpiryDate = faker.date.future().toISOString()
          offence.sentenceEndDate = faker.date.future().toISOString()
          offence.terms = [
            {
              years: 2,
              months: 2,
              days: 3,
              weeks: 2,
              code: 'T1',
            },
          ]
          const expectedSentenceLength = `${offence.terms[0].years} years, ${offence.terms[0].months} months, ${offence.terms[0].weeks} weeks, ${offence?.terms[0].days} days`

          cy.task('getRecommendation', { statusCode: 200, response: recWithOffence })
          cy.visit(testPageUrl)

          cy.get('#indeterminate-sentence').as('summaryList')

          cy.get('@summaryList').then($summaryList => {
            testSummaryList(cy.wrap($summaryList), {
              rows: [
                {
                  key: 'Custody type',
                  value: recWithOffence.bookRecallToPpud.custodyType ?? '- no value',
                },
                {
                  key: 'Offence',
                  value: recWithOffence.bookRecallToPpud.indexOffence ?? '- no value',
                },
                {
                  key: 'Offence date',
                  value: formatDateTimeFromIsoString({ isoDate: offence.offenceDate }),
                },
                {
                  key: 'Release date',
                  value: formatDateTimeFromIsoString({ isoDate: offence.releaseDate }),
                },
                {
                  key: 'Sentencing court',
                  value: offence.courtDescription,
                },
                {
                  key: 'Date of sentence',
                  value: formatDateTimeFromIsoString({ isoDate: offence.sentenceDate }),
                },
                {
                  key: 'Sentence length',
                  value: expectedSentenceLength,
                },
                {
                  key: 'Licence expiry date',
                  value: formatDateTimeFromIsoString({ isoDate: offence.licenceExpiryDate }),
                },
                {
                  key: 'Sentence expiry date',
                  value: formatDateTimeFromIsoString({ isoDate: offence?.sentenceEndDate }),
                },
              ],
            })
          })
        })

        it('displays multi-term sentence rows when there are 2 or more terms', () => {
          const recWithMultiTerms = RecommendationResponseGenerator.generate({
            bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.DETERMINATE },
          })

          const offence = recWithMultiTerms.nomisIndexOffence?.allOptions?.find(
            o => o.offenderChargeId === recWithMultiTerms.nomisIndexOffence?.selected,
          )

          if (offence) {
            offence.terms = [
              { code: 'IMP', years: 5, months: 0, weeks: 0, days: 0 },
              { code: 'LIC', years: 2, months: 6, weeks: 0, days: 0 },
            ]
          }

          cy.task('getRecommendation', { statusCode: 200, response: recWithMultiTerms })
          cy.visit(testPageUrl)

          cy.get('#indeterminate-sentence').within(() => {
            cy.contains('.govuk-summary-list__key', 'Custodial term').should('exist')
            cy.contains('.govuk-summary-list__key', 'Extended term').should('exist')
          })
        })
      })

      describe('Personal details section', () => {
        it('displays the Personal details heading and hint', () => {
          cy.visit(testPageUrl)
          cy.get('h2').eq(1).should('contain.text', 'Personal details')
          cy.get('.govuk-hint').eq(1).should('contain.text', 'Taken from NOMIS.')
        })

        it('displays all personal detail fields', () => {
          const recWithPersonalDetails = RecommendationResponseGenerator.generate({
            bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.DETERMINATE },
          })

          const { bookRecallToPpud } = recWithPersonalDetails
          const { personOnProbation } = recWithPersonalDetails
          if (bookRecallToPpud) {
            bookRecallToPpud.gender = 'Male'
            bookRecallToPpud.cro = 'C23456'
            bookRecallToPpud.prisonNumber = 'P001111'
            bookRecallToPpud.releasingPrison = 'Birmingham'
            bookRecallToPpud.legislationReleasedUnder = 'Birmingham'
            bookRecallToPpud.releasingPrison = 'Birmingham'
          }
          personOnProbation.pncNumber = 'PN23456'
          cy.task('getRecommendation', { statusCode: 200, response: recWithPersonalDetails })
          cy.visit(testPageUrl)

          cy.get('#personalDetails').as('personalDetails')

          cy.get('@personalDetails').within(() => {
            cy.contains('.govuk-summary-list__key', 'NOMIS number')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.personOnProbation?.nomsNumber)

            cy.contains('.govuk-summary-list__key', 'First name(s)')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud?.firstNames)

            cy.contains('.govuk-summary-list__key', 'Last name')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud?.lastName)
            cy.contains('.govuk-summary-list__key', 'Gender')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud?.gender)

            cy.contains('.govuk-summary-list__key', 'Ethnicity')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud?.ethnicity)

            cy.contains('.govuk-summary-list__key', 'Date of birth')
              .siblings('.govuk-summary-list__value')
              .should(
                'contain.text',
                formatDateTimeFromIsoString({
                  isoDate: recWithPersonalDetails.bookRecallToPpud.dateOfBirth,
                  dateOnly: true,
                }),
              )

            cy.contains('.govuk-summary-list__key', 'CRO')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud.cro)

            cy.contains('.govuk-summary-list__key', 'PNC')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.personOnProbation?.pncNumber)

            cy.contains('.govuk-summary-list__key', 'Prison booking number')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud.prisonNumber)

            cy.contains('.govuk-summary-list__key', 'Releasing prison')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud.releasingPrison)

            cy.contains('.govuk-summary-list__key', 'Legislation released under')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud.legislationReleasedUnder)

            cy.contains('.govuk-summary-list__key', 'Current establishment')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithPersonalDetails.bookRecallToPpud.releasingPrison)
          })
        })

        it('displays "In custody" custody status when prison status is ACTIVE IN', () => {
          const recWithPrisonOffender = {
            ...recommendation,
            prisonOffender: { status: 'ACTIVE IN' },
          }

          cy.task('getRecommendation', { statusCode: 200, response: recWithPrisonOffender })

          cy.visit(testPageUrl)

          cy.contains('.govuk-summary-list__key', 'Custody status')
            .siblings('.govuk-summary-list__value')
            .should('contain.text', 'In custody')
        })

        it('displays "Unlawfully at large (UAL)" when prison status is INACTIVE OUT', () => {
          const recWithPrisonOffender = {
            ...recommendation,
            prisonOffender: { status: 'INACTIVE OUT' },
          }

          cy.task('getRecommendation', { statusCode: 200, response: recWithPrisonOffender })
          cy.visit(testPageUrl)
          cy.contains('.govuk-summary-list__key', 'Custody status')
            .siblings('.govuk-summary-list__value')
            .should('contain.text', 'Unlawfully at large (UAL)')
        })

        it('displays "In transit - Unlawfully at large (UAL)" when prison status is INACTIVE TRN', () => {
          const recWithPrisonOffender = {
            ...recommendation,
            prisonOffender: { status: 'INACTIVE TRN' },
          }

          cy.task('getRecommendation', { statusCode: 200, response: recWithPrisonOffender })
          cy.visit(testPageUrl)
          cy.contains('.govuk-summary-list__key', 'Custody status')
            .siblings('.govuk-summary-list__value')
            .should('contain.text', 'In transit - Unlawfully at large (UAL)')
        })

        it('displays last known address and additional address', () => {
          cy.visit(testPageUrl)
          cy.contains('.govuk-summary-list__key', 'Last known address').should('exist')

          const firstAddress = recommendation.personOnProbation.addresses?.[0]
          if (firstAddress && !firstAddress.noFixedAbode) {
            cy.contains('.govuk-summary-list__key', 'Last known address')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', firstAddress.line1)
          }

          cy.contains('.govuk-summary-list__key', 'Last known address')
            .siblings('.govuk-summary-list__value')
            .should('contain.text', 'Additional address')
        })

        it('displays offender image when present', () => {
          const recWithPrisonOffender = {
            ...recommendation,
            prisonOffender: { image: 'prisoner888.jpg' },
          }
          cy.task('getRecommendation', { statusCode: 200, response: recWithPrisonOffender })
          cy.visit(testPageUrl)
          cy.contains('.govuk-summary-list__key', 'Image')
            .siblings('.govuk-summary-list__value')
            .find('img')
            .should('have.attr', 'src', recWithPrisonOffender.prisonOffender.image)
        })
      })

      describe('Probation details section', () => {
        it('displays the Probation details heading and hint', () => {
          cy.visit(testPageUrl)
          cy.get('h2').eq(2).should('contain.text', 'Probation details')
          cy.get('.govuk-hint').eq(2).should('contain.text', 'From the Part A')
        })

        it('displays all probation detail fields', () => {
          const recWithProbationDetails = RecommendationResponseGenerator.generate({
            bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.INDETERMINATE },
          })

          const { bookRecallToPpud } = recWithProbationDetails

          if (bookRecallToPpud) {
            bookRecallToPpud.probationArea = 'Birmingham'
            bookRecallToPpud.policeForce = 'Mid Lands'
            bookRecallToPpud.mappaLevel = 'Manchester'
          }

          cy.task('getRecommendation', { statusCode: 200, response: recWithProbationDetails })
          cy.visit(testPageUrl)

          cy.get('dl').eq(2).as('probationDetails')

          cy.get('@probationDetails').within(() => {
            cy.contains('.govuk-summary-list__key', 'Recall received date')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'Recall received time')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'Recall decision date')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'Recall decision time')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'Probation area')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithProbationDetails.bookRecallToPpud.probationArea)

            cy.contains('.govuk-summary-list__key', 'Probation practitioner')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'Probation practitioner email')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'Probation practitioner phone number')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'Local police contact')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithProbationDetails.bookRecallToPpud.policeForce)

            cy.contains('.govuk-summary-list__key', 'Senior manager (ACO)')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'Senior manager (ACO) email')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')

            cy.contains('.govuk-summary-list__key', 'MAPPA level')
              .siblings('.govuk-summary-list__value')
              .should('contain.text', recWithProbationDetails.bookRecallToPpud.mappaLevel)

            cy.contains('.govuk-summary-list__key', 'Current risk of serious harm')
              .siblings('.govuk-summary-list__value')
              .should('not.be.empty')
          })
        })
      })
    })
  })
})
