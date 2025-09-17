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
      name: 'Jane Bloggs',
    },
    recallType: { selected: { value: 'STANDARD' } },
    activeCustodialConvictionCount: 1,
    managerRecallDecision: {
      isSentToDelius: true,
    },
  }
  const licenceConditionsMultipleActiveCustodial = {
    sectionId: 'licence-conditions',
    statusCode: 200,
    response: {
      activeConvictions: [{ sentence: { isCustodial: true } }, { sentence: { isCustodial: true } }],
    },
  }

  it('task list - Completed - in custody', () => {
    cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('What you recommend Completed').should('exist')
    cy.getElement('When did the SPO agree this recall? Completed').should('exist')
    cy.getElement('What alternatives to recall have been tried already? Completed').should('exist')
    cy.getElement('How has Jane Bloggs responded to probation so far? Completed').should('exist')
    cy.getElement('What licence conditions has Jane Bloggs breached? Completed').should('exist')
    cy.getElement('Would recall affect vulnerability or additional needs? Completed').should('exist')
    cy.getElement('Are there any victims in the victim contact scheme? Completed').should('exist')
    cy.getElement('Is Jane Bloggs in custody now? Completed').should('exist')
    cy.getElement('Is Jane Bloggs under Integrated Offender Management (IOM)? Completed').should('exist')
    cy.getElement('Is Jane Bloggs on an indeterminate sentence? Completed').should('exist')
    cy.getElement('Is Jane Bloggs on an extended sentence? Completed').should('exist')
    cy.getElement('Type of indeterminate sentence Completed').should('exist')
    cy.getElement('Confirm the recall criteria - indeterminate and extended sentences Completed').should('exist')
    cy.getElement('Personal details Reviewed').should('exist')
    cy.getElement('Offence details Reviewed').should('exist')
    cy.getElement('Offence analysis Completed').should('exist')
    cy.getElement('MAPPA for Jane Bloggs Reviewed').should('exist')
    cy.getElement('Previous releases Completed').should('exist')
    cy.getElement('Local police contact details').should('exist')
    // the following link should not be present, as person is in custody
    cy.getElement('Is there anything the police should know before they arrest Jane Bloggs?').should('not.exist')
    cy.getElement('Address').should('not.exist')
    // should not exist
    cy.getElement('Suitability for standard or fixed term recall').should('not.exist')
    cy.getElement('Is this an emergency recall?').should('not.exist')

    cy.getElement("Request line manager's countersignature To do").should('exist')
  })

  it('task list - Completed - not in custody', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, custodyStatus: { selected: 'NO' } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('Is Jane Bloggs in custody now? Completed').should('exist')
    cy.getElement('Local police contact details Completed').should('exist')
    cy.getElement('Is there anything the police should know before they arrest Jane Bloggs? Completed').should('exist')
    cy.getElement('Address Completed').should('exist')
    cy.getElement("Request line manager's countersignature To do").should('exist')
  })

  it('task list - custody undetermined', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, custodyStatus: { selected: undefined } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('Address Completed').should('exist')
  })

  it('task list - Completed - determinate sentence not extended', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, isIndeterminateSentence: false, isExtendedSentence: false },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('Type of indeterminate sentence').should('not.exist')
    cy.getElement('Confirm the recall criteria - indeterminate and extended sentences').should('not.exist')
  })

  it('task list - Completed - determinate sentence is extended', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, isIndeterminateSentence: false, isExtendedSentence: true },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('Type of indeterminate sentence').should('not.exist')
    cy.getElement('Confirm the recall criteria - indeterminate and extended sentences').should('exist')
    cy.getElement('Is this an emergency recall?').should('exist')
  })

  it('task list - To do - not in custody', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: recommendationResponse,
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('What you recommend Completed').should('exist')
    cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
    cy.getElement('How has Jane Bloggs responded to probation so far? To do').should('exist')
    cy.getElement('What licence conditions has Jane Bloggs breached? To do').should('exist')
    cy.getElement('Would recall affect vulnerability or additional needs? To do').should('exist')
    cy.getElement('Are there any victims in the victim contact scheme? To do').should('exist')
    cy.getElement('Is Jane Bloggs in custody now? To do').should('exist')
    cy.getElement('Local police contact details To do').should('exist')
    cy.getElement('Is Jane Bloggs under Integrated Offender Management (IOM)? To do').should('exist')
    cy.getElement('Is there anything the police should know before they arrest Jane Bloggs? To do').should('exist')
    cy.getElement('Is Jane Bloggs on an indeterminate sentence? To do').should('exist')
    cy.getElement('Is Jane Bloggs on an extended sentence? To do').should('exist')
    cy.getElement('Type of indeterminate sentence').should('not.exist')
    cy.getElement('Confirm the recall criteria - indeterminate and extended sentences').should('not.exist')
    cy.getElement('Personal details To review').should('exist')
    cy.getElement('Offence details To review').should('exist')
    cy.getElement('Offence analysis To do').should('exist')
    cy.getElement('MAPPA for Jane Bloggs To review').should('exist')
    cy.getElement('Previous releases To do').should('exist')
    cy.getElement('Create Part A').should('not.exist')
  })

  it('from task list, link to form then return to task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.clickLink('How has Jane Bloggs responded to probation so far?')
    cy.log('============= Back link')
    cy.clickLink('Back')
    cy.pageHeading().should('equal', 'Create a Part A form')
    cy.log('============= Continue button')
    cy.clickLink('How has Jane Bloggs responded to probation so far?')
    cy.fillInput('How has Jane Bloggs responded to probation so far?', 'Re-offending has occurred')
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'Create a Part A form')
    cy.clickLink('When did the SPO agree this recall?')
  })

  it('task list - check links to forms', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: true, custodyStatus: { selected: 'NO' } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getLinkHref('When did the SPO agree this recall?').should('contain', '/recommendations/123/spo-agree-to-recall')
    cy.getLinkHref('What alternatives to recall have been tried already?').should(
      'contain',
      '/recommendations/123/alternatives-tried?fromPageId=task-list&fromAnchor=heading-alternatives'
    )
    cy.getLinkHref('Is Jane Bloggs on an indeterminate sentence?').should(
      'contain',
      '/recommendations/123/is-indeterminate?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('Is Jane Bloggs on an extended sentence?').should(
      'contain',
      '/recommendations/123/is-extended?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('Type of indeterminate sentence').should(
      'contain',
      '/recommendations/123/indeterminate-type?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('How has Jane Bloggs responded to probation so far?').should(
      'contain',
      '/recommendations/123/response-to-probation?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('What licence conditions has Jane Bloggs breached?').should(
      'contain',
      '/recommendations/123/licence-conditions?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('What has led to this recall?').should('contain', '/recommendations/123/what-led')
    cy.getLinkHref('Would recall affect vulnerability or additional needs?').should(
      'contain',
      '/recommendations/123/vulnerabilities'
    )
    cy.getLinkHref('Are there any victims in the victim contact scheme?').should(
      'contain',
      '/recommendations/123/victim-contact-scheme'
    )
    cy.getLinkHref('Is Jane Bloggs in custody now?').should(
      'contain',
      '/recommendations/123/custody-status?fromPageId=task-list&fromAnchor=heading-custody'
    )
    cy.getLinkHref('Local police contact details').should('contain', '/recommendations/123/police-details')
    cy.getLinkHref('Address').should('contain', '/recommendations/123/address-details')
    cy.getLinkHref('Is Jane Bloggs under Integrated Offender Management (IOM)?').should(
      'contain',
      '/recommendations/123/iom'
    )
    cy.getLinkHref('Is there anything the police should know before they arrest Jane Bloggs?').should(
      'contain',
      '/recommendations/123/arrest-issues'
    )
    cy.getLinkHref('Do you think Jane Bloggs is using recall to bring contraband into prison?').should(
      'contain',
      '/recommendations/123/contraband'
    )
    cy.getLinkHref('Address').should(
      'contain',
      '/recommendations/123/address-details?fromPageId=task-list&fromAnchor=heading-person-details'
    )
    cy.getLinkHref('Personal details').should(
      'contain',
      '/recommendations/123/personal-details?fromPageId=task-list&fromAnchor=heading-person-details'
    )
    cy.getLinkHref('Offence details').should(
      'contain',
      '/recommendations/123/offence-details?fromPageId=task-list&fromAnchor=heading-person-details'
    )
    cy.getLinkHref('Offence analysis').should(
      'contain',
      '/recommendations/123/offence-analysis?fromPageId=task-list&fromAnchor=heading-person-details'
    )
    cy.getLinkHref('Previous releases').should(
      'contain',
      '/recommendations/123/previous-releases?fromPageId=task-list&fromAnchor=heading-person-details'
    )
    cy.getLinkHref('MAPPA for Jane Bloggs').should(
      'contain',
      '/recommendations/123/mappa?fromPageId=task-list&fromAnchor=heading-risk-profile'
    )
  })
  it('task list - review and send', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: true, custodyStatus: { selected: 'NO' } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

    cy.getElement('Who completed this Part A?').should('exist')
    cy.getElement('Where should the revocation order be sent?').should('exist')
    cy.getElement('Where should PPCS respond with questions?').should('exist')
  })

  it('task list - user can create Part A even if they have multiple active custodial convictions', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, licenceConditionsBreached: null },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: licenceConditionsMultipleActiveCustodial,
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
  })

  it('task list - determinate, not extended, standard recall', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...completeRecommendationResponse,
        isIndeterminateSentence: false,
        isExtendedSentence: false,
        recallType: { selected: { value: 'STANDARD' } },
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getLinkHref('Is this an emergency recall?').should(
      'contain',
      '/recommendations/123/emergency-recall?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getElement('Add any additional licence conditions - fixed term recall').should('not.exist')
  })

  it('task list - determinate, not extended, fixed term recall', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...completeRecommendationResponse,
        isIndeterminateSentence: false,
        isExtendedSentence: false,
        recallType: { selected: { value: 'FIXED_TERM' } },
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getLinkHref('Suitability for standard or fixed term recall').should(
      'contain',
      `/recommendations/${recommendationId}/suitability-for-fixed-term-recall?fromPageId=task-list&fromAnchor=heading-recommendation`
    )
    cy.getLinkHref('Add any additional licence conditions - fixed term recall').should(
      'contain',
      '/recommendations/123/fixed-licence?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getElement('Is this an emergency recall?').should('exist')
  })

  it('task list - indeterminate type and details links visible if indeterminate sentence', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...completeRecommendationResponse,
        isIndeterminateSentence: true,
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getLinkHref('Type of indeterminate sentence').should(
      'contain',
      '/recommendations/123/indeterminate-type?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
    cy.getLinkHref('Confirm the recall criteria - indeterminate and extended sentences').should(
      'contain',
      '/recommendations/123/indeterminate-details?fromPageId=task-list&fromAnchor=heading-circumstances'
    )
  })

  it('task list - determinate, not extended, fixed term recall and FTR flag', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...completeRecommendationResponse,
        isIndeterminateSentence: false,
        isExtendedSentence: false,
        recallType: { selected: { value: 'FIXED_TERM' } },
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('Suitability for standard or fixed term recall To do').should('exist')
  })
  it('task list - determinate, not extended, fixed term recall and FTR flag and suitability completed', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...completeRecommendationResponse,
        isIndeterminateSentence: false,
        isExtendedSentence: false,
        recallType: { selected: { value: 'FIXED_TERM' } },
        isUnder18: false,
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getElement('Suitability for standard or fixed term recall Completed').should('exist')
  })

  describe('Routing', () => {
    it('redirect recall task list to no recall task list if no recall is set', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'NO_RECALL_DECIDED', active: true }] })
      cy.visit(`${routeUrls.recommendations}/1/task-list`)
      cy.pageHeading().should('equal', 'Create a decision not to recall letter')
    })

    it('redirect no recall task list to recall task list if recall is set', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallType: { selected: { value: 'FIXED_TERM' } } },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/1/task-list-no-recall`)
      cy.pageHeading().should('equal', 'Create a Part A form')
    })
  })

  describe('Admin Journey', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('present Share this Part A', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list/`)

      cy.getElement('Share this Part A').should('exist')
    })

    it('present Preview Part A', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list/?flagPreviewPartA=1`)

      cy.getElement('Preview this Part A').should('exist')
    })
  })
})
