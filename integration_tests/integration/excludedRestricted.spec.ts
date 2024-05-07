import { routeUrls } from '../../server/routes/routeUrls'
import excludedResponse from '../../api/responses/get-case-excluded.json'
import restrictedResponse from '../../api/responses/get-case-restricted.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'

context('Excluded and restricted cases', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.window().then(win => win.sessionStorage.clear())
    cy.task('getUser', { user: 'USER1', statusCode: 200, response: { homeArea: { code: 'N07', name: 'London' } } })
    cy.signIn()
    cy.mockCaseSummaryData()
  })

  context('Excluded', () => {
    it('overview page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('risk page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('personal details page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('licence conditions page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCaseV2', { sectionId: 'licence-conditions', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('contact history page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })
  })

  context('Restricted', () => {
    it('overview page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('risk page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('personal details page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('licence conditions page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCaseV2', { sectionId: 'licence-conditions', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('contact history page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })
  })

  context('User not found', () => {
    it('overview page', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          userAccessResponse: {
            userNotFound: true,
          },
        },
      })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.pageHeading().should('equal', 'User not found')
      cy.contains(
        'There is a problem with your NDelius account. Contact support on the HMPPS Technology Portal for help.'
      ).should('exist')
    })
  })
})
