import { routeUrls } from '../../server/routes/routeUrls'
import excludedResponse from '../../api/responses/get-case-excluded.json'
import restrictedResponse from '../../api/responses/get-case-restricted.json'
import personSearchExcludedResponse from '../../api/responses/get-person-search-excluded.json'
import personSearchRestrictedResponse from '../../api/responses/get-person-search-restricted.json'

context('Excluded and restricted cases', () => {
  beforeEach(() => {
    cy.signIn()
    cy.mockCaseSummaryData()
  })

  context('Excluded', () => {
    it('search results page', () => {
      cy.visit(`${routeUrls.start}?flagSearchByName=0`)
      cy.task('getPersonsByCrn', { statusCode: 200, response: personSearchExcludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.searchResultsByCRN}?crn=${crn}`)
      cy.contains('You are excluded from viewing this case').should('exist')
      cy.getText('name').should('equal', '(read more information)')
    })

    it('overview page', () => {
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('risk page', () => {
      cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('personal details page', () => {
      cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('licence conditions page', () => {
      cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=0`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('contact history page', () => {
      cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: excludedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })
  })

  context('Restricted', () => {
    it('search results page', () => {
      cy.visit(`${routeUrls.start}?flagSearchByName=0`)
      cy.task('getPersonsByCrn', { statusCode: 200, response: personSearchRestrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.searchResultsByCRN}?crn=${crn}`)
      cy.contains('This is a restricted case').should('exist')
      cy.getText('name').should('equal', '(read more information)')
    })

    it('overview page', () => {
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('risk page', () => {
      cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('personal details page', () => {
      cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('licence conditions page', () => {
      cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=0`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })

    it('contact history page', () => {
      cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: restrictedResponse })
      const crn = 'X34983'
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.pageHeading().should('equal', 'Restricted case')
      cy.contains('You are restricted from viewing this offender record. Please contact OM John Smith').should('exist')
    })
  })

  context('User not found', () => {
    it('overview page', () => {
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
