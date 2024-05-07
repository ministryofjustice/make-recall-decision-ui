import { routeUrls } from '../../server/routes/routeUrls'
import { formOptions } from '../../server/controllers/recommendations/formOptions/formOptions'
import { caseTemplate } from '../fixtures/CaseTemplateBuilder'
import {
  basicActiveConvictionTemplate,
  standardActiveConvictionTemplate,
} from '../fixtures/ActiveConvictionTemplateBuilder'
import {
  deliusLicenceConditionDoNotPossess,
  deliusLicenceConditionFreedomOfMovement,
  deliusLicenceConditionParticipateOrCoOperate,
} from '../fixtures/DeliusLicenceConditionTemplateBuilder'

import completeRecommendationResponse from '../../api/responses/get-recommendation.json'

context('Licence conditions', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.window().then(win => win.sessionStorage.clear())
    cy.task('getUser', { user: 'USER1', statusCode: 200, response: { homeArea: { code: 'N07', name: 'London' } } })
    cy.signIn()
  })

  it('shows conditions for multiple active custodial convictions, and a banner', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(
          basicActiveConvictionTemplate()
            .withDescription('Burglary - 05714')
            .withLicenceCondition(deliusLicenceConditionDoNotPossess())
            .withLicenceCondition(deliusLicenceConditionFreedomOfMovement())
        )
        .withActiveConviction(
          basicActiveConvictionTemplate()
            .withDescription('Robbery - 05727')
            .withLicenceCondition(deliusLicenceConditionParticipateOrCoOperate())
        )
        .withAllConvictionsReleasedOnLicence()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    // Additional licence conditions
    cy.getElement('Burglary - 05714').should('exist')
    cy.getElement('Robbery - 05727').should('exist')
    cy.getElement({ qaAttr: 'offence-heading' }).should('have.length', 2)
    cy.get('[data-qa="additional"] .app-summary-card').should('have.length', 3)

    cy.getElement('This person has 2 or more active convictions in NDelius').should('exist')

    cy.getElement('Poss, own, control, inspect specified items /docs').should('exist')
    cy.getElement('Freedom of movement').should('exist')
    cy.getElement('Participate or co-op with Programme or Activities').should('exist')

    cy.getElement('Notes').should('not.exist')
  })

  it('shows no conditions for multiple active custodial convictions where one is not released on licence, and a banner', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(standardActiveConvictionTemplate().withDescription('Burglary - 05714'))
        .withActiveConviction(standardActiveConvictionTemplate().withDescription('Robbery - 05727'))
        .withAllConvictionsNotReleasedOnLicence()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    cy.getElement({ qaAttr: 'standard' }).should('not.exist')
    cy.getElement({ qaAttr: 'additional' }).should('not.exist')
    cy.getElement(
      'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
    ).should('exist')
  })

  it('shows no conditions for a single active custodial conviction which is not released on licence, and a banner', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(
          standardActiveConvictionTemplate().withDescription('Robbery - 05727').withNotReleasedOnLicence()
        )
        .withAllConvictionsNotReleasedOnLicence()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    cy.getElement({ qaAttr: 'standard' }).should('not.exist')
    cy.getElement({ qaAttr: 'additional' }).should('not.exist')
    cy.getElement(
      'This person is not on licence in NDelius. Check the throughcare details in NDelius are correct.'
    ).should('exist')
  })
  it('shows no conditions for a multiple active custodial conviction which is not released on licence, and a banner', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(
          standardActiveConvictionTemplate().withDescription('Burglary - 05714').withNotReleasedOnLicence()
        )
        .withActiveConviction(
          standardActiveConvictionTemplate().withDescription('Robbery - 05727').withReleasedOnLicence()
        )
        .withAllConvictionsNotReleasedOnLicence()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    cy.getElement({ qaAttr: 'standard' }).should('not.exist')
    cy.getElement({ qaAttr: 'additional' }).should('not.exist')
    cy.getElement(
      'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
    ).should('exist')
  })
  it('shows no conditions for a single active custodial conviction which is not released on licence, and a banner', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(
          standardActiveConvictionTemplate().withDescription('Robbery - 05727').withReleasedOnLicence()
        )
        .withAllConvictionsNotReleasedOnLicence()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    cy.getElement({ qaAttr: 'standard' }).should('not.exist')
    cy.getElement({ qaAttr: 'additional' }).should('not.exist')
    cy.getElement(
      'This person is not on licence in NDelius. Check the throughcare details in NDelius are correct.'
    ).should('exist')
  })

  it('shows ndelius licence conditions when CVL has no licence', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(
          basicActiveConvictionTemplate()
            .withDescription('Burglary - 05714')
            .withLicenceCondition(
              deliusLicenceConditionFreedomOfMovement().withNotes('Must not enter Islington borough.')
            )
        )
        .withNoCvlLicence()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    // Standard licence conditions
    cy.clickButton('Show', { parent: '[data-qa="standard"]' })
    formOptions.standardLicenceConditions.forEach(condition => cy.getElement(condition.text).should('exist'))
    // Additional licence conditions
    cy.getElement('Burglary - 05714').should('exist')
    cy.get('[data-qa="additional"] .app-summary-card').should('have.length', 1)
    cy.getElement('Freedom of movement').should('exist')
    cy.getText('condition-description').should('equal', 'On release to be escorted by police to Approved Premises')
    cy.getText('condition-note').should('equal', 'Must not enter Islington borough.')
  })

  it('shows CVL licence conditions when CVL has a licence', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(standardActiveConvictionTemplate().withDescription('Robbery - 05727'))
        .withCvlLicence()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    // Standard licence conditions
    cy.clickButton('Show', { parent: '[data-qa="standard"]' })
    cy.getElement('This is a standard licence condition').should('exist')
    // Additional licence conditions
    cy.get('[data-qa="additional"] .app-summary-card').should('have.length', 1)
    cy.getElement('Freedom of movement').should('exist')
    cy.getText('condition-note').should('equal', 'Expanded additional licence condition')
    // Bespoke licence conditions
    cy.get('[data-qa="bespoke"] .app-summary-card').should('have.length', 1)
    cy.getElement('This is a bespoke condition').should('exist')
  })

  it('do not show bespoke section if no bespoke licences', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(standardActiveConvictionTemplate().withDescription('Robbery - 05714'))
        .withCvlLicence()
        .withNoBespokeConditions()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    cy.get('[data-qa="bespoke"]').should('not.exist')
  })

  it('do not show bespoke section if no additional licences', () => {
    cy.task(
      'getCaseV2',
      caseTemplate()
        .withActiveConviction(standardActiveConvictionTemplate().withDescription('Robbery - 05714'))
        .withCvlLicence()
        .withNoAdditionalCvlLicenceConditions()
        .build()
    )
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/X34983/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    cy.get('[data-qa="additional"]').should('not.exist')
  })
})
