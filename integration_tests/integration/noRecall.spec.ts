import { DateTime } from 'luxon'
import routeUrls from '../../server/routes/routeUrls'
import noRecallResponse from '../../api/responses/get-recommendation-no-recall.json'
import setResponsePropertiesToNull from '../support/commands'
import { SentenceGroup } from '../../server/controllers/recommendations/sentenceInformation/formOptions'

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
      name: 'Jane Bloggs',
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
        errorText: 'Tell Jane Bloggs why the licence breach is a problem',
      })
      cy.assertErrorMessage({
        fieldName: 'noRecallRationale',
        errorText: 'Tell Jane Bloggs why they are not being recalled',
      })
      cy.assertErrorMessage({
        fieldName: 'popProgressMade',
        errorText: 'Remind Jane Bloggs about their progress',
      })
      cy.assertErrorMessage({
        fieldName: 'futureExpectations',
        errorText: "Tell Jane Bloggs what you've agreed for the future",
      })
    })

    it('form validation - next appointment', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/appointment-no-recall`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'howWillAppointmentHappen',
        errorText: 'Select how the appointment will happen',
      })
      cy.assertErrorMessage({
        fieldName: 'dateTimeOfAppointment',
        fieldGroupId: 'dateTimeOfAppointment-day',
        errorText: 'Enter the date and time of the appointment',
      })
      cy.assertErrorMessage({
        fieldName: 'probationPhoneNumber',
        errorText: 'Give a telephone number for probation',
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
      cy.getElement('How has Jane Bloggs responded to probation so far? To do').should('exist')
      cy.getElement('What licence conditions has Jane Bloggs breached? To do').should('exist')
      cy.getElement('Is Jane Bloggs on an indeterminate sentence? To do').should('exist')
      cy.getElement('Is Jane Bloggs on an extended sentence? To do').should('exist')
      cy.getElement('Type of indeterminate sentence To do').should('not.exist')
      cy.getElement('Why you considered recall To do').should('exist')
      cy.getElement('Why Jane Bloggs should not be recalled To do').should('exist')
      cy.getElement('Appointment date and time To do').should('exist')
      cy.getElement('Create letter').should('not.exist')
    })

    it('Completed', () => {
      cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getElement('What you recommend Completed').should('exist')
      cy.getElement('What alternatives to recall have been tried already? Completed').should('exist')
      cy.getElement('How has Jane Bloggs responded to probation so far? Completed').should('exist')
      cy.getElement('What licence conditions has Jane Bloggs breached? Completed').should('exist')
      cy.getElement('Is Jane Bloggs on an indeterminate sentence? Completed').should('exist')
      cy.getElement('Is Jane Bloggs on an extended sentence? Completed').should('exist')
      cy.getElement('Type of indeterminate sentence Completed').should('exist')
      cy.getElement('Why you considered recall Completed').should('exist')
      cy.getElement('Why Jane Bloggs should not be recalled Completed').should('exist')
      cy.getElement('Appointment date and time Completed').should('exist')
      cy.clickLink('Create letter')
    })

    it('task list - check links to forms', () => {
      cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getLinkHref('Why you considered recall').should(
        'contain',
        '/recommendations/123/why-considered-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter',
      )
      cy.getLinkHref('Why Jane Bloggs should not be recalled').should(
        'contain',
        '/recommendations/123/reasons-no-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter',
      )
      cy.getLinkHref('Appointment date and time').should(
        'contain',
        '/recommendations/123/appointment-no-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter',
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

  describe('Ftr56: Task list', () => {
    it('To do - Adult_SDS - Mappa should exist', () => {
      const recommendation = {
        ...recommendationResponse,
        sentenceGroup: SentenceGroup.ADULT_SDS,
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall?flagFTR56Enabled=1`)
      cy.getElement('MAPPA information to assess recall type To do').should('exist')
      cy.getElement('Suitability for standard or fixed term recall To do').should('exist')
      cy.getElement('What you recommend Completed').should('exist')
      cy.getElement('When did the SPO agree this recall? To do').should('exist')

      cy.getElement('What has made you consider recalling Jane Bloggs? To do').should('exist')
      cy.getElement('What licence conditions has Jane Bloggs breached? To do').should('exist')
      cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
      cy.getElement("Jane Bloggs's sentence information").should('exist')
      cy.getElement('What type of sentence is Jane Bloggs on?').should('not.exist')
      cy.getElement('Is Harry Bloggs on an indeterminate sentence?').should('not.exist')
      cy.getElement('Is Harry Bloggs on an extended sentence?').should('not.exist')

      cy.getElement('Explain why you considered recall To do').should('exist')
      cy.getElement('Explain why Jane Bloggs should not be recalled To do').should('exist')
      cy.getElement('Add the appointment date and time To do').should('exist')
      cy.getElement('Preview the letter').should('not.exist')
    })

    it('To do - Youth SDS - Mappa should not exist', () => {
      const recommendation = {
        ...recommendationResponse,
        sentenceGroup: SentenceGroup.YOUTH_SDS,
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall?flagFTR56Enabled=1`)
      cy.getElement('MAPPA information to assess recall type').should('not.exist')
      cy.getElement('Suitability for standard or fixed term recall To do').should('exist')
      cy.getElement('What you recommend Completed').should('exist')
      cy.getElement('When did the SPO agree this recall? To do').should('exist')

      cy.getElement('What has made you consider recalling Jane Bloggs? To do').should('exist')
      cy.getElement('What licence conditions has Jane Bloggs breached? To do').should('exist')
      cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
      cy.getElement("Jane Bloggs's sentence information").should('exist')
      cy.getElement('What type of sentence is Jane Bloggs on?').should('not.exist')
      cy.getElement('Is Harry Bloggs on an indeterminate sentence?').should('not.exist')
      cy.getElement('Is Harry Bloggs on an extended sentence?').should('not.exist')

      cy.getElement('Explain why you considered recall To do').should('exist')
      cy.getElement('Explain why Jane Bloggs should not be recalled To do').should('exist')
      cy.getElement('Add the appointment date and time To do').should('exist')
      cy.getElement('Preview the letter').should('not.exist')
    })

    it('To do - Indeterminate - What type of sentence question should exist', () => {
      const recommendation = {
        ...recommendationResponse,
        sentenceGroup: SentenceGroup.INDETERMINATE,
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall?flagFTR56Enabled=1`)
      cy.getElement('MAPPA information to assess recall type').should('not.exist')
      cy.getElement('Suitability for standard or fixed term recall To do').should('not.exist')
      cy.getElement('What you recommend Completed').should('exist')
      cy.getElement('When did the SPO agree this recall? To do').should('exist')

      cy.getElement('What has made you consider recalling Jane Bloggs? To do').should('exist')
      cy.getElement('What licence conditions has Jane Bloggs breached? To do').should('exist')
      cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
      cy.getElement("Jane Bloggs's sentence information").should('exist')

      cy.getElement('What type of sentence is Jane Bloggs on? To do').should('exist')

      cy.getElement('Type of indeterminate sentence').should('not.exist')
      cy.getElement('Is Harry Bloggs on an indeterminate sentence?').should('not.exist')
      cy.getElement('Is Harry Bloggs on an extended sentence?').should('not.exist')

      cy.getElement('Explain why you considered recall To do').should('exist')
      cy.getElement('Explain why Jane Bloggs should not be recalled To do').should('exist')
      cy.getElement('Add the appointment date and time To do').should('exist')
      cy.getElement('Preview the letter').should('not.exist')
    })

    it('To do - Extended - What type of sentence question should exist', () => {
      const recommendation = {
        ...recommendationResponse,
        sentenceGroup: SentenceGroup.EXTENDED,
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall?flagFTR56Enabled=1`)
      cy.getElement('MAPPA information to assess recall type').should('not.exist')
      cy.getElement('Suitability for standard or fixed term recall To do').should('not.exist')
      cy.getElement('What you recommend Completed').should('exist')
      cy.getElement('When did the SPO agree this recall? To do').should('exist')

      cy.getElement('What has made you consider recalling Jane Bloggs? To do').should('exist')
      cy.getElement('What licence conditions has Jane Bloggs breached? To do').should('exist')
      cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
      cy.getElement("Jane Bloggs's sentence information").should('exist')

      cy.getElement('Is Harry Bloggs on an indeterminate sentence?').should('not.exist')
      cy.getElement('Is Harry Bloggs on an extended sentence?').should('not.exist')

      cy.getElement('Explain why you considered recall To do').should('exist')
      cy.getElement('Explain why Jane Bloggs should not be recalled To do').should('exist')
      cy.getElement('Add the appointment date and time To do').should('exist')
      cy.getElement('Preview the letter').should('not.exist')
    })

    it('Completed', () => {
      const recommendation = {
        ...noRecallResponse,
        triggerLeadingToRecall: 'reason',
        sentenceGroup: SentenceGroup.ADULT_SDS,
        personOnProbation: {
          name: 'Jane Bloggs',
          ftr56MappaReviewed: true,
        },
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall?flagFTR56Enabled=1`)

      cy.getElement('MAPPA information to assess recall type Completed').should('exist')
      // TODO: Fix this once MRD-3097 is merged
      cy.getElement('Suitability for standard or fixed term recall').should('exist')
      cy.getElement('What you recommend Completed').should('exist')
      cy.getElement('When did the SPO agree this recall? Completed').should('exist')

      cy.getElement('What has made you consider recalling Jane Bloggs? Completed').should('exist')
      cy.getElement('What licence conditions has Jane Bloggs breached? Completed').should('exist')
      cy.getElement('What alternatives to recall have been tried already? Completed').should('exist')
      cy.getElement("Jane Bloggs's sentence information Completed").should('exist')

      cy.getElement('Type of indeterminate sentence').should('not.exist')
      cy.getElement('Is Harry Bloggs on an indeterminate sentence?').should('not.exist')
      cy.getElement('Is Harry Bloggs on an extended sentence?').should('not.exist')

      cy.getElement('Explain why you considered recall Completed').should('exist')
      cy.getElement('Explain why Jane Bloggs should not be recalled Completed').should('exist')
      cy.getElement('Add the appointment date and time Completed').should('exist')
      cy.getElement('Preview the letter').should('exist')

      cy.getElement('Create letter').should('exist')
    })

    type LinkCheck = { text: string; href: string }

    function getRecallTypeSlug(recommendation: { sentenceGroup: SentenceGroup }) {
      switch (recommendation.sentenceGroup) {
        case SentenceGroup.INDETERMINATE:
          return 'recall-type-indeterminate'
        case SentenceGroup.EXTENDED:
          return 'recall-type-extended'
        default:
          return 'recall-type'
      }
    }

    function checkTaskListLinks(sentenceGroup: SentenceGroup, extraLinks: LinkCheck[] = []) {
      const recommendation = {
        ...noRecallResponse,
        sentenceGroup,
      }

      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall?flagFTR56Enabled=1`)

      const recallTypeSlug = getRecallTypeSlug(recommendation)
      // Base links for all sentence groups
      const baseLinks: LinkCheck[] = [
        {
          text: 'What you recommend',
          href: `/recommendations/123/${recallTypeSlug}?fromPageId=task-list-no-recall&fromAnchor=heading-recommendation`,
        },
        {
          text: 'When did the SPO agree this recall',
          href: '/recommendations/123/spo-agree-to-recall?fromPageId=task-list-no-recall&fromAnchor=heading-recommendation',
        },
        {
          text: 'What has made you consider recalling Jane Bloggs?',
          href: '/recommendations/123/trigger-leading-to-recall?fromPageId=task-list-no-recall&fromAnchor=heading-circumstances',
        },
        {
          text: 'What licence conditions has Jane Bloggs breached?',
          href: '/recommendations/123/licence-conditions?fromPageId=task-list-no-recall&fromAnchor=heading-circumstances',
        },
        {
          text: 'What alternatives to recall have been tried already?',
          href: '/recommendations/123/alternatives-tried?fromPageId=task-list-no-recall&fromAnchor=heading-alternatives',
        },
        {
          text: "Jane Bloggs's sentence information",
          href: '/recommendations/123/sentence-information?fromPageId=task-list-no-recall&fromAnchor=heading-alternatives',
        },
        {
          text: 'Explain why you considered recall',
          href: '/recommendations/123/why-considered-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter',
        },
        {
          text: 'Explain why Jane Bloggs should not be recalled',
          href: '/recommendations/123/reasons-no-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter',
        },
        {
          text: 'Add the appointment date and time',
          href: '/recommendations/123/appointment-no-recall?fromPageId=task-list-no-recall&fromAnchor=heading-create-letter',
        },
        { text: 'Preview of the letter', href: '/recommendations/123/preview-no-recall' },
      ]

      const allLinks = [...baseLinks, ...extraLinks]

      allLinks.forEach(link => cy.getLinkHref(link.text).should('contain', link.href))
    }

    // Tests
    it('task list - ADULT_SDS - check links to forms', () => {
      checkTaskListLinks(SentenceGroup.ADULT_SDS, [
        {
          text: 'MAPPA information to assess recall type',
          href: '/recommendations/123/check-mappa-information?fromPageId=task-list-no-recall&fromAnchor=heading-recommendation',
        },
        {
          text: 'Suitability for standard or fixed term recall',
          href: '/recommendations/123/suitability-for-fixed-term-recall?fromPageId=task-list-no-recall&fromAnchor=heading-recommendation',
        },
      ])
    })

    it('task list - Youth SDS - check links to forms', () => {
      checkTaskListLinks(SentenceGroup.YOUTH_SDS, [
        {
          text: 'Suitability for standard or fixed term recall',
          href: '/recommendations/123/suitability-for-fixed-term-recall?fromPageId=task-list-no-recall&fromAnchor=heading-recommendation',
        },
      ])
    })

    it('task list - Indeterminate - check links to forms', () => {
      checkTaskListLinks(SentenceGroup.INDETERMINATE, [
        {
          text: 'What type of sentence is Jane Bloggs on?',
          href: '/recommendations/123/indeterminate-type?fromPageId=task-list-no-recall&fromAnchor=heading-alternatives',
        },
      ])
    })

    it('task list - EXTENDED - check links to forms', () => {
      checkTaskListLinks(SentenceGroup.EXTENDED)
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
      cy.getText('pop-address').should('equal', 'Jane Bloggs\n123 Oak Avenue\nBirmingham\nB23 1BC')
      cy.getText('probation-address').should('equal', 'Probation office address')
      cy.getText('pop-salutation').should('equal', 'Dear Jane')
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
