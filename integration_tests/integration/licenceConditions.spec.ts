import { routeUrls } from '../../server/routes/routeUrls'
import { formOptions } from '../../server/controllers/recommendations/formOptions/formOptions'

const TEMPLATE = {
  sectionId: 'licence-conditions',
  statusCode: 200,
  response: {
    personalDetailsOverview: {
      name: 'Charles Edwin',
      dateOfBirth: '1980-07-24',
      age: 41,
      gender: 'Male',
      crn: 'X430109',
    },
    hasAllConvictionsReleasedOnLicence: true,
    activeConvictions: [
      {
        mainOffence: { description: 'Burglary - 05714' },
        sentence: { isCustodial: true, custodialStatusCode: 'B' },
        licenceConditions: [
          {
            notes: 'Must not enter Islington borough.',
            mainCategory: {
              code: 'NLC9',
              description: 'Supervision in the community',
            },
            subCategory: {
              code: 'NSTT9',
              description: 'Bespoke Condition (See Notes)',
            },
          },
        ],
      },
    ],
    cvlLicence: {
      licenceStatus: 'ACTIVE',
      conditionalReleaseDate: '2022-06-10',
      actualReleaseDate: '2022-06-11',
      sentenceStartDate: '2022-06-12',
      sentenceEndDate: '2022-06-13',
      licenceStartDate: '2022-06-14',
      licenceExpiryDate: '2022-06-15',
      topupSupervisionStartDate: '2022-06-16',
      topupSupervisionExpiryDate: '2022-06-17',
      standardLicenceConditions: [
        {
          text: 'This is a standard licence condition',
          expandedText: null,
        },
      ],
      additionalLicenceConditions: [
        {
          category: 'Freedom of Movement',
          expandedText: 'Expanded additional licence condition',
        },
      ],
      bespokeConditions: [
        {
          text: 'This is a bespoke condition',
          expandedText: null,
        },
      ],
    },
  },
}

context('Licence conditions', () => {
  beforeEach(() => {
    cy.window().then(win => win.sessionStorage.clear())
    cy.signIn()
  })

  it('shows conditions for a single active custodial conviction', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=0`)
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    // Standard licence conditions
    cy.clickButton('Show', { parent: '[data-qa="standard"]' })
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
        activeConvictions: [
          {
            mainOffence: { description: 'Burglary - 05714' },
            sentence: { isCustodial: true, custodialStatusCode: 'B' },
            licenceConditions: [],
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=0`)
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement('Burglary - 05714').should('exist')
    cy.getElement('There are no additional licence conditions in NDelius. Check the licence document.').should('exist')
  })

  it('shows a message if there are no active custodial convictions', () => {
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        activeConvictions: [{ sentence: { isCustodial: false } }],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=0`)
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement(
      'This person has no active convictions. Double-check that the information in NDelius is correct.'
    ).should('exist')
  })

  it('shows conditions for multiple active custodial convictions, and a banner', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=0`)
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        activeConvictions: [
          {
            mainOffence: { description: 'Burglary - 05714' },
            sentence: { isCustodial: true, custodialStatusCode: 'B' },
            licenceConditions: [
              {
                mainCategory: { description: 'Supervision in the community' },
                subCategory: { description: 'On release to be escorted by police to Approved Premises' },
              },
              {
                mainCategory: { description: 'Poss, own, control, inspect specified items /docs' },
                subCategory: { description: 'tbc' },
              },
            ],
          },
          {
            mainOffence: { description: 'Robbery' },
            sentence: { isCustodial: true, custodialStatusCode: 'B' },
            licenceConditions: [
              {
                mainCategory: { description: 'Participate or co-op with Programme or Activities' },
                subCategory: { description: 'Bespoke' },
              },
            ],
          },
        ],
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    // Additional licence conditions
    cy.getElement('Burglary - 05714').should('exist')
    cy.getElement('Robbery').should('exist')
    cy.getElement({ qaAttr: 'offence-heading' }).should('have.length', 2)
    cy.get('[data-qa="additional"] .app-summary-card').should('have.length', 3)

    cy.getElement('This person has 2 or more active convictions in NDelius').should('exist')

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

  it('shows no conditions for multiple active custodial convictions where one is not released on licence, and a banner', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=0`)
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        activeConvictions: [
          {
            mainOffence: { description: 'Burglary - 05714' },
            sentence: { isCustodial: true, custodialStatusCode: 'B' },
            licenceConditions: [],
          },
          {
            mainOffence: { description: 'Robbery' },
            sentence: { isCustodial: true, custodialStatusCode: 'A' },
            licenceConditions: [],
          },
        ],
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement({ qaAttr: 'standard' }).should('not.exist')
    cy.getElement({ qaAttr: 'additional' }).should('not.exist')
    cy.getElement(
      'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
    ).should('exist')
  })

  it('shows no conditions for a single active custodial conviction which is not released on licence, and a banner', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=0`)
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        activeConvictions: [
          {
            mainOffence: { description: 'Robbery' },
            sentence: { isCustodial: true, custodialStatusCode: 'A' },
            licenceConditions: [],
          },
        ],
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement({ qaAttr: 'standard' }).should('not.exist')
    cy.getElement({ qaAttr: 'additional' }).should('not.exist')
    cy.getElement(
      'This person is not on licence in NDelius. Check the throughcare details in NDelius are correct.'
    ).should('exist')
  })
  it('shows no conditions for a multiple active custodial conviction which is not released on licence, and a banner - flagCvl', () => {
    cy.task('getCaseV2', {
      ...TEMPLATE,
      response: {
        ...TEMPLATE.response,
        hasAllConvictionsReleasedOnLicence: false,
        activeConvictions: [
          {
            mainOffence: { description: 'Robbery' },
            sentence: { isCustodial: true, custodialStatusCode: 'A' },
            licenceConditions: [],
          },
          {
            mainOffence: { description: 'Littering' },
            sentence: { isCustodial: true, custodialStatusCode: 'B' },
            licenceConditions: [],
          },
        ],
      },
    })

    const crn = 'X34983'
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=1`)
    cy.getElement({ qaAttr: 'standard' }).should('not.exist')
    cy.getElement({ qaAttr: 'additional' }).should('not.exist')
    cy.getElement(
      'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
    ).should('exist')
  })
  it('shows no conditions for a single active custodial conviction which is not released on licence, and a banner - flagCvl', () => {
    cy.task('getCaseV2', {
      ...TEMPLATE,
      response: {
        ...TEMPLATE.response,
        hasAllConvictionsReleasedOnLicence: false,
        activeConvictions: [
          {
            mainOffence: { description: 'Robbery' },
            sentence: { isCustodial: true, custodialStatusCode: 'A' },
            licenceConditions: [],
          },
        ],
      },
    })

    const crn = 'X34983'
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=1`)
    cy.getElement({ qaAttr: 'standard' }).should('not.exist')
    cy.getElement({ qaAttr: 'additional' }).should('not.exist')
    cy.getElement(
      'This person is not on licence in NDelius. Check the throughcare details in NDelius are correct.'
    ).should('exist')
  })
})

context('Licence conditions - flagCvl', () => {
  beforeEach(() => {
    cy.window().then(win => win.sessionStorage.clear())
    cy.signIn()
  })

  it('shows ndelius licence conditions when CVL has no licence', () => {
    cy.task('getCaseV2', {
      ...TEMPLATE,
      response: {
        ...TEMPLATE.response,
        cvlLicence: null,
      },
    })

    const crn = 'X34983'
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=1`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    // Standard licence conditions
    cy.clickButton('Show', { parent: '[data-qa="standard"]' })
    formOptions.standardLicenceConditions.forEach(condition => cy.getElement(condition.text).should('exist'))
    // Additional licence conditions
    cy.getElement('Burglary - 05714').should('exist')
    cy.get('[data-qa="additional"] .app-summary-card').should('have.length', 1)
    cy.getElement('Supervision in the community').should('exist')
    cy.getText('condition-description').should('equal', 'Bespoke Condition (See Notes)')
    cy.getText('condition-note').should('equal', 'Must not enter Islington borough.')
  })

  it('shows CVL licence conditions when CVL has a licence', () => {
    cy.task('getCaseV2', TEMPLATE)

    const crn = 'X34983'
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=1`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    // Standard licence conditions
    cy.clickButton('Show', { parent: '[data-qa="standard"]' })
    cy.getElement('This is a standard licence condition').should('exist')
    // Additional licence conditions
    cy.get('[data-qa="additional"] .app-summary-card').should('have.length', 1)
    cy.getElement('Freedom of Movement').should('exist')
    cy.getText('condition-note').should('equal', 'Expanded additional licence condition')
    // Bespoke licence conditions
    cy.get('[data-qa="bespoke"] .app-summary-card').should('have.length', 1)
    cy.getElement('This is a bespoke condition').should('exist')
  })

  it('do not show bespoke section if no bespoke licences', () => {
    cy.task('getCaseV2', {
      ...TEMPLATE,
      response: {
        ...TEMPLATE.response,
        cvlLicence: {
          ...TEMPLATE.response.cvlLicence,
          bespokeConditions: [],
        },
      },
    })

    const crn = 'X34983'
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=1`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    cy.get('[data-qa="bespoke"]').should('not.exist')
  })

  it('do not show bespoke section if no additional licences', () => {
    cy.task('getCaseV2', {
      ...TEMPLATE,
      response: {
        ...TEMPLATE.response,
        cvlLicence: {
          ...TEMPLATE.response.cvlLicence,
          additionalLicenceConditions: [],
        },
      },
    })

    const crn = 'X34983'
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions?flagCvl=1`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    cy.get('[data-qa="additional"]').should('not.exist')
  })
})
