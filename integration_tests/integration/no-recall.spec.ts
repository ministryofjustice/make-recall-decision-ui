import { DateTime } from 'luxon'
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

    it('task list - check links to forms', () => {
      cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getLinkHref('Why you considered recall').should(
        'contain',
        '/recommendations/123/why-considered-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter'
      )
      cy.getLinkHref('Why Paula Smith should not be recalled').should(
        'contain',
        '/recommendations/123/reasons-no-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter'
      )
      cy.getLinkHref('Appointment date and time').should(
        'contain',
        '/recommendations/123/appointment-no-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter'
      )
      cy.getLinkHref('Preview of the letter').should('contain', '/recommendations/123/preview-no-recall')
    })

    it('task list - hide preview letter link if other tasks not complete', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...noRecallResponse, nextAppointment: null } })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getElement('Preview of the letter').should('not.exist')
    })
  })

  describe('Preview letter', () => {
    it('redirects to preview letter after appointment page, if other create letter tasks are complete', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: noRecallResponse,
      })
      cy.task('updateRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.task('createNoRecallLetter', {
        response: {
          letterContent: {},
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/appointment-no-recall`)
      const nextYear = DateTime.now().year + 1
      cy.enterDateTime({
        day: '1',
        month: '2',
        year: nextYear.toString(),
        hour: '23',
        minute: '12',
      })
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Preview the decision not to recall letter')
    })

    it('redirects to task list after appointment page, if other create letter tasks are not complete', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...noRecallResponse, whyConsideredRecall: null },
      })
      cy.task('updateRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/appointment-no-recall`)
      const nextYear = DateTime.now().year + 1
      cy.enterDateTime({
        day: '1',
        month: '2',
        year: nextYear.toString(),
        hour: '23',
        minute: '12',
      })
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a decision not to recall letter')
    })

    it('Lets the user edit the letter', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: noRecallResponse,
      })
      cy.task('createNoRecallLetter', {
        response: {
          letterContent: {
            letterAddress: 'Paula Smith\n123 Acacia Avenue\nBirmingham\nB23 1BC',
            letterDate: '12/09/2022',
            salutation: 'Dear Paula',
            letterTitle: 'DECISION NOT TO RECALL',
            section1: 'section 1',
            section2: 'section 2',
            section3: 'section 3',
            signedByParagraph: 'Yours sincerely,\nProbation practitioner',
          },
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/preview-no-recall`)
      cy.getText('pop-address').should('equal', 'Paula Smith\n123 Acacia Avenue\nBirmingham\nB23 1BC')
      cy.getText('probation-address').should('equal', 'Probation office address')
      cy.getText('pop-salutation').should('equal', 'Dear Paula')
      cy.getText('letter-date').should('equal', '12/09/2022')
      cy.getText('letter-title').should('equal', 'DECISION NOT TO RECALL')
      cy.getText('section-1').should('equal', 'section 1')
      cy.getText('section-2').should('equal', 'section 2')
      cy.getText('section-3').should('equal', 'section 3')
      cy.getText('signature').should('contain', 'Yours sincerely,')
      cy.clickLink('Edit')
      cy.pageHeading().should('equal', 'Why you considered recall')
    })
  })
})
