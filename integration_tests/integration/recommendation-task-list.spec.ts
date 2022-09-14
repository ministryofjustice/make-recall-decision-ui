import { routeUrls } from '../../server/routes/routeUrls'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import { setResponsePropertiesToNull } from '../support/commands'

context('Recommendation - task list', () => {
  beforeEach(() => {
    cy.signIn()
  })

  const crn = 'X34983'
  const recommendationId = '123'
  const recommendationResponse = {
    ...setResponsePropertiesToNull(completeRecommendationResponse),
    id: recommendationId,
    crn,
    personOnProbation: {
      name: 'Paula Smith',
    },
  }
  const licenceConditionsMultipleActiveCustodial = {
    sectionId: 'licence-conditions',
    statusCode: 200,
    response: {
      convictions: [
        {
          active: true,
          isCustodial: true,
          offences: [],
        },
        {
          active: true,
          isCustodial: true,
          offences: [],
        },
      ],
    },
  }

  it('task list - completed - in custody', () => {
    cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('What you recommend completed').should('exist')
    cy.getElement('Alternatives tried already completed').should('exist')
    cy.getElement('Response to probation so far completed').should('exist')
    cy.getElement('Breached licence condition(s) completed').should('exist')
    cy.getElement('Emergency recall completed').should('exist')
    cy.getElement('Would recall affect vulnerability or additional needs? completed').should('exist')
    cy.getElement('Are there any victims in the victim contact scheme? completed').should('exist')
    cy.getElement('Is Paula Smith in custody now? completed').should('exist')
    cy.getElement('Is Paula Smith under Integrated Offender Management (IOM)? completed').should('exist')
    cy.getElement('Is Paula Smith on an indeterminate sentence? completed').should('exist')
    cy.getElement('Is Paula Smith on an extended sentence? completed').should('exist')
    cy.getElement('Type of indeterminate sentence completed').should('exist')
    // the following 2 links should not be present, as person is in custody
    cy.getElement('Local police contact details').should('not.exist')
    cy.getElement('Is there anything the police should know before they arrest Paula Smith?').should('not.exist')
    cy.clickLink('Create Part A')
  })

  it('task list - completed - not in custody', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, custodyStatus: { selected: 'NO' } },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('What you recommend completed').should('exist')
    cy.getElement('Alternatives tried already completed').should('exist')
    cy.getElement('Response to probation so far completed').should('exist')
    cy.getElement('Breached licence condition(s) completed').should('exist')
    cy.getElement('Emergency recall completed').should('exist')
    cy.getElement('Would recall affect vulnerability or additional needs? completed').should('exist')
    cy.getElement('Are there any victims in the victim contact scheme? completed').should('exist')
    cy.getElement('Is Paula Smith in custody now? completed').should('exist')
    cy.getElement('Local police contact details completed').should('exist')
    cy.getElement('Is Paula Smith under Integrated Offender Management (IOM)? completed').should('exist')
    cy.getElement('Is there anything the police should know before they arrest Paula Smith? completed').should('exist')
    cy.getElement('Is Paula Smith on an indeterminate sentence? completed').should('exist')
    cy.getElement('Is Paula Smith on an extended sentence? completed').should('exist')
    cy.getElement('Type of indeterminate sentence completed').should('exist')
    cy.clickLink('Create Part A')
  })

  it('task list - to do', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('What you recommend to do').should('exist')
    cy.getElement('Alternatives tried already to do').should('exist')
    cy.getElement('Response to probation so far to do').should('exist')
    cy.getElement('Breached licence condition(s) to do').should('exist')
    cy.getElement('Emergency recall to do').should('exist')
    cy.getElement('Would recall affect vulnerability or additional needs? to do').should('exist')
    cy.getElement('Are there any victims in the victim contact scheme? to do').should('exist')
    cy.getElement('Is Paula Smith in custody now? to do').should('exist')
    cy.getElement('Local police contact details to do').should('exist')
    cy.getElement('Is Paula Smith under Integrated Offender Management (IOM)? to do').should('exist')
    cy.getElement('Is there anything the police should know before they arrest Paula Smith? to do').should('exist')
    cy.getElement('Is Paula Smith on an indeterminate sentence? to do').should('exist')
    cy.getElement('Is Paula Smith on an extended sentence? to do').should('exist')
    cy.getElement('Type of indeterminate sentence').should('not.exist')
    cy.getElement('Create Part A').should('not.exist')
  })

  it('from task list, link to form then return to task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.clickLink('What you recommend')
    cy.log('============= Back link')
    cy.clickLink('Back')
    cy.pageHeading().should('equal', 'Create a Part A form')
    cy.log('============= Continue button')
    cy.clickLink('What you recommend')
    cy.selectRadio('What do you recommend?', 'Standard recall')
    cy.fillInput('Why do you recommend this recall type?', 'Details...', { parent: '#conditional-recallType-2' })
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'Create a Part A form')
  })

  it('task list - check links to forms', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: true },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getLinkHref('Alternatives tried already').should(
      'contain',
      '/recommendations/123/alternatives-tried?fromPageId=task-list&fromAnchor=heading-alternatives'
    )
    cy.getLinkHref('Is Paula Smith on an indeterminate sentence?').should(
      'contain',
      '/recommendations/123/is-indeterminate'
    )
    cy.getLinkHref('Is Paula Smith on an extended sentence?').should('contain', '/recommendations/123/is-extended')
    cy.getLinkHref('Type of indeterminate sentence').should('contain', '/recommendations/123/indeterminate-type')
    cy.getLinkHref('Response to probation so far').should(
      'contain',
      '/recommendations/123/response-to-probation?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('Breached licence condition(s)').should(
      'contain',
      '/recommendations/123/licence-conditions?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('What has led to this recall?').should('contain', '/recommendations/123/what-led')
    cy.getLinkHref('Emergency recall').should(
      'contain',
      '/recommendations/123/emergency-recall?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('Would recall affect vulnerability or additional needs?').should(
      'contain',
      '/recommendations/123/vulnerabilities'
    )
    cy.getLinkHref('Are there any victims in the victim contact scheme?').should(
      'contain',
      '/recommendations/123/victim-contact-scheme'
    )
    cy.getLinkHref('Is Paula Smith in custody now?').should(
      'contain',
      '/recommendations/123/custody-status?fromPageId=task-list&fromAnchor=heading-custody'
    )
    cy.getLinkHref('Local police contact details').should('contain', '/recommendations/123/police-details')
    cy.getLinkHref('Is Paula Smith under Integrated Offender Management (IOM)?').should(
      'contain',
      '/recommendations/123/iom'
    )
    cy.getLinkHref('Is there anything the police should know before they arrest Paula Smith?').should(
      'contain',
      '/recommendations/123/arrest-issues'
    )
    cy.getLinkHref('Do you think Paula Smith is using recall to bring contraband into prison?').should(
      'contain',
      '/recommendations/123/contraband'
    )
  })

  it('task list - user can create Part A even if they have multiple active custodial convictions', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, licenceConditionsBreached: null },
    })
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: licenceConditionsMultipleActiveCustodial,
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
  })
})
