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
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/why-considered-recall`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'whyConsideredRecall',
        errorText: 'Select a reason why you considered recall',
      })
    })

    it('form validation - reasons for no recall', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/reasons-no-recall`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'licenceBreach',
        errorText: 'You must tell Paula Smith why the licence breach is a problem',
      })
      cy.assertErrorMessage({
        fieldName: 'noRecallRationale',
        errorText: 'You must tell Paula Smith why they are not being recalled',
      })
      cy.assertErrorMessage({
        fieldName: 'popProgressMade',
        errorText: 'You must remind Paula Smith about their progress',
      })
      cy.assertErrorMessage({
        fieldName: 'futureExpectations',
        errorText: "You must tell Paula Smith what you've agreed for the future",
      })
    })

    it('form validation - next appointment', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getElement('What you recommend Completed').should('exist')
      cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
      cy.getElement('How has Paula Smith responded to probation so far? To do').should('exist')
      cy.getElement('What licence conditions has Paula Smith breached? To do').should('exist')
      cy.getElement('Is Paula Smith on an indeterminate sentence? To do').should('exist')
      cy.getElement('Is Paula Smith on an extended sentence? To do').should('exist')
      cy.getElement('Type of indeterminate sentence To do').should('not.exist')
      cy.getElement('Why you considered recall To do').should('exist')
      cy.getElement('Why Paula Smith should not be recalled To do').should('exist')
      cy.getElement('Appointment date and time To do').should('exist')
      cy.getElement('Create letter').should('not.exist')
    })

    it('Completed', () => {
      cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getElement('What you recommend Completed').should('exist')
      cy.getElement('What alternatives to recall have been tried already? Completed').should('exist')
      cy.getElement('How has Paula Smith responded to probation so far? Completed').should('exist')
      cy.getElement('What licence conditions has Paula Smith breached? Completed').should('exist')
      cy.getElement('Is Paula Smith on an indeterminate sentence? Completed').should('exist')
      cy.getElement('Is Paula Smith on an extended sentence? Completed').should('exist')
      cy.getElement('Type of indeterminate sentence Completed').should('exist')
      cy.getElement('Why you considered recall Completed').should('exist')
      cy.getElement('Why Paula Smith should not be recalled Completed').should('exist')
      cy.getElement('Appointment date and time Completed').should('exist')
      cy.clickLink('Create letter')
    })

    it('task list - check links to forms', () => {
      cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.createNoRecallLetter()
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
