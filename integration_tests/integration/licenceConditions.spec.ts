import { routeUrls } from '../../server/routes/routeUrls'
import { formOptions } from '../../server/controllers/recommendations/formOptions'

context('Licence conditions', () => {
  beforeEach(() => {
    cy.window().then(win => win.sessionStorage.clear())
    cy.signIn()
  })

  it('can view the licence conditions page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    // Standard licence conditions
    cy.clickButton('Show this section')
    formOptions.standardLicenceConditions.forEach(condition => cy.getElement(condition.text).should('exist'))
    // Additional licence conditions
    cy.getElement('Murder - 00100').should('exist')
    cy.getElement({ qaAttr: 'additional-condition' }).should('have.length', 1)
    cy.getElement('Supervision in the community').should('exist')
    cy.getText('condition-description').should('equal', 'Bespoke Condition (See Notes)')
    cy.getText('condition-note').should('equal', 'Must not enter Islington borough.')
  })

  it('shows a message for an active conviction with no licence conditions', () => {
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        convictions: [
          {
            active: true,
            isCustodial: true,
            offences: [],
            licenceConditions: [{ active: false }],
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement('None available.').should('exist')
  })

  it('shows a message if there are no licence conditions', () => {
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        convictions: [
          {
            active: false,
            offences: [],
            licenceConditions: [{ active: false }],
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement('There are no licence conditions available.').should('exist')
  })
})
