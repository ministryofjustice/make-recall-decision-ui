import { fakerEN_GB as faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import { setDateInput, verifyInputs } from '../../../../../componentTests/date.tests'
import searchMappedUserResponse from '../../../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../../../api/responses/ppudSearchActiveUsers.json'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'
import CUSTODY_GROUP from '../../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import RECOMMENDATION_STATUS from '../../../../../../server/middleware/recommendationStatus'
import { testForErrorPageTitle, testForErrorSummary } from '../../../../../componentTests/errors.tests'
import { MIN_VALUE_YEAR } from '../../../../../../server/utils/dates/conversion'

context('Indeterminate Sentence - Edit Release Date Page', () => {
  const recommendationId = '123'
  const inputName = 'release-date'
  const inputId = 'releaseDate'

  const testPageUrl = `/recommendations/${recommendationId}/edit-release-date`

  beforeEach(() => {
    cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
    cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
  })

  const sentenceId = faker.number.int().toString()
  const ppudReleaseDate = faker.date.future()
  const editedReleaseDate = faker.date.future()
  const defaultRecommendationResponse = RecommendationResponseGenerator.generate({
    bookRecallToPpud: {
      custodyGroup: CUSTODY_GROUP.INDETERMINATE,
      ppudSentenceId: sentenceId,
      ppudIndeterminateSentenceData: {
        releaseDate: editedReleaseDate,
      },
    },
    ppudOffender: {
      sentences: [{ id: sentenceId, releaseDate: ppudReleaseDate }],
    },
  })
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  beforeEach(() => {
    cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
  })

  describe('Page Data', () => {
    it('Standard page load', () => {
      cy.visit(testPageUrl)

      // Page Headings and body content
      cy.pageHeading().should('contain', 'Edit release date')
      cy.get('.govuk-body').should('contain.text', 'Update the information to record in PPUD')

      cy.get('h2').should('have.class', 'govuk-heading-m').should('contain.text', 'Currently in PPUD')

      // It is possible for the test to run on a machine on a timezone other than Europe/London (which the production
      // code uses). Therefore, we convert the date to Europe/London here to ensure the date shown on the page is as
      // expected.
      const ppudReleaseDateTime = DateTime.fromISO(ppudReleaseDate.toISOString(), { zone: 'Europe/London' })
      ppudReleaseDateTime.setLocale('en-GB')
      cy.get('p.govuk-body').should(
        'contain.text',
        `${ppudReleaseDateTime.day} ${ppudReleaseDateTime.monthLong} ${ppudReleaseDateTime.year}`,
      )

      // Date input surrounds
      cy.get('fieldset').as('dateFieldset')

      cy.get('@dateFieldset')
        .find('legend')
        .should('exist')
        .should('have.class', 'govuk-fieldset__legend--m')
        .should('contain.text', 'Release date')

      cy.get('@dateFieldset')
        .find(`div#${inputName}-hint`)
        .should('exist')
        .should('contain.text', 'For example, 27 3 2023')

      cy.get('@dateFieldset').find(`#${inputName}`).should('exist').as('dateInputGroups')

      cy.get('@dateInputGroups').find('label').should('exist').should('have.length', 3).as('dateInputLabels')
      cy.get('@dateInputGroups').find('input').should('exist').should('have.length', 3).as('dateInputs')

      // Individual labels and input
      const inputTestCases = [
        { suffix: 'day', label: 'Day', value: editedReleaseDate.getDate() },
        { suffix: 'month', label: 'Month', value: editedReleaseDate.getMonth() + 1 },
        { suffix: 'year', label: 'Year', value: editedReleaseDate.getFullYear() },
      ]
      inputTestCases.forEach(({ suffix, label, value }, i) => {
        cy.get('@dateInputLabels')
          .eq(i)
          .should('contain.attr', 'for', `${inputId}-${suffix}`)
          .should('contain.text', label)
        cy.get('@dateInputs')
          .eq(i)
          .should('have.id', `${inputId}-${suffix}`)
          .should('have.attr', 'name', suffix)
          .should('have.value', value)
      })

      // Continue button
      cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
    })
  })

  describe('Error message display', () => {
    const testInvalidDate = (
      inputs: Array<number | undefined>,
      errorSuffix: 'day' | 'month' | 'year',
      errorMessage: string,
    ) => {
      setDateInput(inputId, ...inputs)
      cy.get('button').click()
      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: `${inputId}-${errorSuffix}`,
          message: errorMessage,
          errorComponentId: 'release-date-error',
        },
      ])
      verifyInputs(inputId, ...inputs)
    }
    describe('WHEN an invalid date is provided', () => {
      beforeEach(() => {
        cy.signIn()
        cy.visit(testPageUrl)
      })
      it('- Blank Date: Error links to day', () => testInvalidDate([], 'day', 'Enter the release date'))
      it('- Blank Day: Error links to day', () =>
        testInvalidDate([undefined, 1, 2000], 'day', 'The release date must include a day'))
      it('- Blank Month: Error links to month', () =>
        testInvalidDate([1, undefined, 2000], 'month', 'The release date must include a month'))
      it('- Blank Year: Error links to year', () =>
        testInvalidDate([1, 1, undefined], 'year', 'The release date must include a year'))
      it('- Blank Day/Month: Error links to day', () =>
        testInvalidDate([undefined, undefined, 2020], 'day', 'The release date must include a day and month'))
      it('- Blank Day/Year: Error links to day', () =>
        testInvalidDate([undefined, 1, undefined], 'day', 'The release date must include a day and year'))
      it('- Blank Month/Year: Error links to month', () =>
        testInvalidDate([1, undefined, undefined], 'month', 'The release date must include a month and year'))
      it('- Year less than the minimum: Error links to year', () =>
        testInvalidDate(
          [1, 1, MIN_VALUE_YEAR - 1],
          'year',
          `The release date must include a year after ${MIN_VALUE_YEAR}`,
        ))
      it('- Day that does not exist: Error links to day', () =>
        testInvalidDate([99, 1, 2020], 'day', 'The release date must have a real day'))
      it('- Month that does not exist: Error links to month', () =>
        testInvalidDate([1, 99, 2020], 'month', 'The release date must have a real month'))
      it('- Year that does not exist: Error links to year', () =>
        testInvalidDate([1, 1, 12345], 'year', 'The release date must have a real year'))
      const now = new Date(Date.now())
      it('- Date in the future: Error links to day', () =>
        testInvalidDate(
          [now.getDate(), now.getMonth() + 1, now.getFullYear() + 1],
          'day',
          'The release date must be today or in the past',
        ))
    })
  })
})
