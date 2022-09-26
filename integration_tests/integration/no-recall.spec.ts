import { routeUrls } from '../../server/routes/routeUrls'
import noRecallResponse from '../../api/responses/get-recommendation-no-recall.json'
import { setResponsePropertiesToNull } from '../support/commands'

context('No recall', () => {
  beforeEach(() => {
    cy.signIn()
  })

  const crn = 'X34983'
  const recommendationId = '123'
  const recommendationResponse = {
    ...setResponsePropertiesToNull(noRecallResponse),
    recallType: { selected: { value: 'NO_RECALL' } },
    id: recommendationId,
    crn,
    personOnProbation: {
      name: 'Paula Smith',
    },
  }

  describe('Form validation', () => {
    it('form validation - why you considered recall', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/why-considered-recall`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'whyConsideredRecall',
        errorText: 'Select a reason why you considered recall',
      })
    })

    it('form validation - reasons for no recall', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/reasons-no-recall`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'licenceBreach',
        errorText: 'You must explain the licence breach',
      })
      cy.assertErrorMessage({
        fieldName: 'noRecallRationale',
        errorText: 'You must explain your rationale for not recalling Paula Smith',
      })
      cy.assertErrorMessage({
        fieldName: 'popProgressMade',
        errorText: 'You must explain what progress Paula Smith has made so far',
      })
      cy.assertErrorMessage({
        fieldName: 'futureExpectations',
        errorText: 'You must explain what is expected in the future',
      })
    })

    it('form validation - next appointment', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/appointment-no-recall`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'howWillAppointmentHappen',
        errorText: 'You must select how the appointment will happen',
      })
      cy.assertErrorMessage({
        fieldName: 'dateTimeOfAppointment',
        fieldGroupId: 'dateTimeOfAppointment-day',
        errorText: 'Enter the date and time of the appointment',
      })
      cy.assertErrorMessage({
        fieldName: 'probationPhoneNumber',
        errorText: 'You must give a telephone number for probation',
      })
    })
  })

  describe('Task list', () => {
    it('To do', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getElement('What you recommend completed').should('exist')
      cy.getElement('Alternatives tried already to do').should('exist')
      cy.getElement('Response to probation so far to do').should('exist')
      cy.getElement('Breached licence condition(s) to do').should('exist')
      cy.getElement('Is Paula Smith on an indeterminate sentence? to do').should('exist')
      cy.getElement('Is Paula Smith on an extended sentence? to do').should('exist')
      cy.getElement('Type of indeterminate sentence to do').should('not.exist')
      cy.getElement('Why you considered recall to do').should('exist')
      cy.getElement('Why Paula Smith should not be recalled to do').should('exist')
      cy.getElement('Appointment date and time to do').should('exist')
      cy.getElement('Create letter').should('not.exist')
    })

    it('Completed', () => {
      cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getElement('What you recommend completed').should('exist')
      cy.getElement('Alternatives tried already completed').should('exist')
      cy.getElement('Response to probation so far completed').should('exist')
      cy.getElement('Breached licence condition(s) completed').should('exist')
      cy.getElement('Is Paula Smith on an indeterminate sentence? completed').should('exist')
      cy.getElement('Is Paula Smith on an extended sentence? completed').should('exist')
      cy.getElement('Type of indeterminate sentence completed').should('exist')
      cy.getElement('Why you considered recall completed').should('exist')
      cy.getElement('Why Paula Smith should not be recalled completed').should('exist')
      cy.getElement('Appointment date and time completed').should('exist')
      cy.clickLink('Create letter')
    })
  })
})
