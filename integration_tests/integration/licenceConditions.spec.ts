import { routeUrls } from '../../server/routes/routeUrls'
import { formOptions } from '../../server/controllers/recommendations/helpers/formOptions'

context('Licence conditions', () => {
  beforeEach(() => {
    cy.window().then(win => win.sessionStorage.clear())
    cy.signIn()
  })

  it('shows conditions for a single active custodial conviction', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    // Standard licence conditions
    cy.clickButton('Show this section')
    formOptions.standardLicenceConditions.forEach(condition => cy.getElement(condition.text).should('exist'))
    // Additional licence conditions
    cy.getElement('Murder - 00100').should('exist')
    cy.get('[data-qa="additional"] .app-summary-card').should('have.length', 1)
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
            offences: [
              {
                mainOffence: true,
                description: 'Burglary - 05714',
              },
            ],
            licenceConditions: [{ active: false }],
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement('Burglary - 05714').should('exist')
    cy.getElement('There are no additional licence conditions in NDelius. Check the licence document.').should('exist')
  })

  it('shows a message if there are no active custodial convictions', () => {
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        convictions: [
          {
            active: true,
            isCustodial: false,
            offences: [],
            licenceConditions: [{ active: false }],
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement('This person has no active convictions.').should('exist')
  })

  it('shows conditions for multiple active custodial convictions, and a banner', () => {
    const crn = 'X34983'
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        convictions: [
          {
            active: true,
            isCustodial: true,
            offences: [
              {
                mainOffence: true,
                description: 'Burglary - 05714',
              },
            ],
            licenceConditions: [
              {
                active: true,
                licenceConditionTypeMainCat: {
                  description: 'Supervision in the community',
                },
                licenceConditionTypeSubCat: {
                  description: 'On release to be escorted by police to Approved Premises',
                },
              },
              {
                active: true,
                licenceConditionTypeMainCat: {
                  description: 'Poss, own, control, inspect specified items /docs',
                },
                licenceConditionTypeSubCat: {
                  description: 'tbc',
                },
              },
            ],
          },
          {
            active: true,
            isCustodial: true,
            offences: [
              {
                mainOffence: true,
                description: 'Robbery',
              },
            ],
            licenceConditions: [
              {
                active: true,
                licenceConditionTypeMainCat: {
                  description: 'Participate or co-op with Programme or Activities',
                },
                licenceConditionTypeSubCat: {
                  description: 'Bespoke',
                },
              },
            ],
          },
        ],
      },
    })
    cy.interceptGoogleAnalyticsEvent(
      {
        ea: 'multipleCustodialConvictionsBanner',
        ec: crn,
        el: '2',
      },
      'multipleConvictionsEvent'
    )
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    // Additional licence conditions
    cy.getElement('Burglary - 05714').should('exist')
    cy.getElement('Robbery').should('exist')
    cy.getElement({ qaAttr: 'offence-heading' }).should('have.length', 2)
    cy.get('[data-qa="additional"] .app-summary-card').should('have.length', 3)

    cy.getElement('This person has 2 or more active convictions in NDelius').should('exist')
    cy.wait('@multipleConvictionsEvent')

    // first condition
    cy.getElement('Poss, own, control, inspect specified items /docs', {
      parent: '[data-qa="additional-condition-1"]',
    }).should('exist')
    cy.getElement('Supervision in the community', { parent: '[data-qa="additional-condition-2"]' }).should('exist')
    cy.getElement('Participate or co-op with Programme or Activities', {
      parent: '[data-qa="additional-condition-3"]',
    }).should('exist')

    // if no notes
    cy.getElement('Notes', {
      parent: '[data-qa="additional-condition-3"]',
    }).should('not.exist')
  })
})
