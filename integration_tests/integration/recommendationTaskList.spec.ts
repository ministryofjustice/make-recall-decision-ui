import { routeUrls } from '../../server/routes/routeUrls'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import { setResponsePropertiesToNull } from '../support/commands'
import { RecommendationResponse } from '../../server/@types/make-recall-decision-api'
import { RecallTypeSelectedValue } from '../../server/@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import recallTypeValues = RecallTypeSelectedValue.value

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

  context('task list form links', () => {
    function setUp(recResponse: RecommendationResponse) {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: recResponse,
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    }

    function checkLink(linkText: string, url: string) {
      cy.getLinkHref(linkText).should('contain', url)
    }

    function checkLinkDoesntExist(linkText: string) {
      cy.getElement(linkText).should('not.exist')
    }

    context('recommendation decision details', () => {
      const suitabilityLinkText = 'Suitability for standard or fixed term recall'

      function checkSuitabilityLink() {
        checkLink(
          suitabilityLinkText,
          `/recommendations/${recommendationId}/suitability-for-fixed-term-recall?fromPageId=task-list&fromAnchor=heading-recommendation`
        )
      }

      function checkRecallTypeLink(
        recallTypePath: 'recall-type' | 'recall-type-indeterminate' | 'recall-type-extended'
      ) {
        checkLink(
          'What you recommend',
          `/recommendations/${recommendationId}/${recallTypePath}?fromPageId=task-list&fromAnchor=heading-recommendation`
        )
      }

      function checkSpoAgreementLink() {
        checkLink('When did the SPO agree this recall?', `/recommendations/${recommendationId}/spo-agree-to-recall`)
      }

      Object.keys(recallTypeValues).forEach(recallTypeValue => {
        ;[true, false].forEach(isIndeterminateSentence => {
          ;[true, false].forEach(isExtendedSentence => {
            context(
              `${recallTypeValue.toString()} recall for ${isIndeterminateSentence ? 'in' : ''}determinate, ${isExtendedSentence ? '' : 'non-'}extended sentence`,
              () => {
                let expectedRecallTypeLink: 'recall-type' | 'recall-type-indeterminate' | 'recall-type-extended'
                if (isIndeterminateSentence) {
                  expectedRecallTypeLink = 'recall-type-indeterminate'
                } else {
                  expectedRecallTypeLink = isExtendedSentence ? 'recall-type-extended' : 'recall-type'
                }
                const recommendation = RecommendationResponseGenerator.generate({
                  isIndeterminateSentence,
                  isExtendedSentence,
                  recallType: {
                    selected: {
                      value: recallTypeValue as RecallTypeSelectedValue.value,
                    },
                  },
                })
                beforeEach(() => {
                  setUp(recommendation)
                })
                if (!isIndeterminateSentence && !isExtendedSentence) {
                  it('shows suitability link', () => {
                    checkSuitabilityLink()
                  })
                } else {
                  it("doesn't show suitability link", () => {
                    checkLinkDoesntExist(suitabilityLinkText)
                  })
                }
                it('shows recall type link', () => {
                  checkRecallTypeLink(expectedRecallTypeLink)
                })
                it('shows SPO agreement link', () => {
                  checkSpoAgreementLink()
                })
              }
            )
          })
        })
      })
    })

    context('circumstances details', () => {
      const whatHasLedToRecallLinkText = 'What has led to this recall?'
      const emergencyRecallLinkText = 'Is this an emergency recall?'
      const indeterminateTypeLinkText = 'Type of indeterminate sentence'
      const ftrAdditionalLicenceConditionsLinkText = 'Add any additional licence conditions - fixed term recall'
      const indeterminateOrExtendedDetailsLinkText =
        'Confirm the recall criteria - indeterminate and extended sentences'

      function checkResponseToProbationLink(personOnProbationName: string) {
        checkLink(
          `How has ${personOnProbationName} responded to probation so far?`,
          `/recommendations/${recommendationId}/response-to-probation?fromPageId=task-list&fromAnchor=heading-circumstances`
        )
      }

      function checkLicenceConditionsLink(personOnProbationName: string) {
        checkLink(
          `What licence conditions has ${personOnProbationName} breached?`,
          `/recommendations/${recommendationId}/licence-conditions?fromPageId=task-list&fromAnchor=heading-circumstances`
        )
      }

      function checkAlternativesTriedLink() {
        checkLink(
          'What alternatives to recall have been tried already?',
          `/recommendations/${recommendationId}/alternatives-tried?fromPageId=task-list&fromAnchor=heading-alternatives`
        )
      }

      function checkWhatLedToRecallLink() {
        checkLink(whatHasLedToRecallLinkText, `/recommendations/${recommendationId}/what-led`)
      }

      function checkEmergencyRecallLink() {
        checkLink(
          emergencyRecallLinkText,
          `/recommendations/${recommendationId}/emergency-recall?fromPageId=task-list&fromAnchor=heading-circumstances`
        )
      }

      function checkIsIndeterminateLink(personOnProbationName: string) {
        checkLink(
          `Is ${personOnProbationName} on an indeterminate sentence?`,
          `/recommendations/${recommendationId}/is-indeterminate?fromPageId=task-list&fromAnchor=heading-circumstances`
        )
      }

      function checkIndeterminateTypeLink() {
        checkLink(
          indeterminateTypeLinkText,
          `/recommendations/${recommendationId}/indeterminate-type?fromPageId=task-list&fromAnchor=heading-circumstances`
        )
      }

      function checkIsExtendedLink(personOnProbationName: string) {
        checkLink(
          `Is ${personOnProbationName} on an extended sentence?`,
          `/recommendations/${recommendationId}/is-extended?fromPageId=task-list&fromAnchor=heading-circumstances`
        )
      }

      function checkFTRAdditionalLicenceConditionsLink() {
        checkLink(
          ftrAdditionalLicenceConditionsLinkText,
          `/recommendations/${recommendationId}/fixed-licence?fromPageId=task-list&fromAnchor=heading-circumstances`
        )
      }

      function checkIndeterminateOrExtendedDetailsLink() {
        checkLink(
          indeterminateOrExtendedDetailsLinkText,
          `/recommendations/${recommendationId}/indeterminate-details?fromPageId=task-list&fromAnchor=heading-circumstances`
        )
      }

      Object.keys(recallTypeValues).forEach(recallTypeValue => {
        ;[true, false].forEach(isIndeterminateSentence => {
          ;[true, false].forEach(isExtendedSentence => {
            context(
              `${recallTypeValue.toString()} recall for ${isIndeterminateSentence ? 'in' : ''}determinate, ${isExtendedSentence ? '' : 'non-'}extended sentence`,
              () => {
                const isRecall = recallTypeValue !== recallTypeValues.NO_RECALL
                const recommendation = RecommendationResponseGenerator.generate({
                  isIndeterminateSentence,
                  isExtendedSentence,
                  recallType: {
                    selected: {
                      value: recallTypeValue as RecallTypeSelectedValue.value,
                    },
                  },
                })
                beforeEach(() => {
                  setUp(recommendation)
                })
                it('shows response to probation link', () => {
                  checkResponseToProbationLink(recommendation.personOnProbation.name)
                })
                it('shows licence conditions link', () => {
                  checkLicenceConditionsLink(recommendation.personOnProbation.name)
                })
                it('shows alternatives tried link', () => {
                  checkAlternativesTriedLink()
                })
                if (isRecall) {
                  it('shows what led to recall link', () => {
                    checkWhatLedToRecallLink()
                  })
                } else {
                  it("doesn't show what led to recall link", () => {
                    checkLinkDoesntExist(whatHasLedToRecallLinkText)
                  })
                }
                if (isRecall && !isIndeterminateSentence) {
                  it('shows emergency recall link', () => {
                    checkEmergencyRecallLink()
                  })
                } else {
                  it("doesn't show emergency recall link", () => {
                    checkLinkDoesntExist(emergencyRecallLinkText)
                  })
                }
                it('shows is indeterminate link', () => {
                  checkIsIndeterminateLink(recommendation.personOnProbation.name)
                })
                if (isIndeterminateSentence) {
                  it('shows indeterminate type link', () => {
                    checkIndeterminateTypeLink()
                  })
                } else {
                  it("doesn't show indeterminate type link", () => {
                    checkLinkDoesntExist(indeterminateTypeLinkText)
                  })
                }
                it('shows is extended link', () => {
                  checkIsExtendedLink(recommendation.personOnProbation.name)
                })
                if (
                  recallTypeValue === recallTypeValues.FIXED_TERM &&
                  !isIndeterminateSentence &&
                  !isExtendedSentence
                ) {
                  it('shows additional FTR licence conditions link', () => {
                    checkFTRAdditionalLicenceConditionsLink()
                  })
                } else {
                  it("doesn't show additional FTR licence conditions link", () => {
                    checkLinkDoesntExist(ftrAdditionalLicenceConditionsLinkText)
                  })
                }
                if (isRecall && (isIndeterminateSentence || isExtendedSentence)) {
                  it('shows indeterminate or extended details link', () => {
                    checkIndeterminateOrExtendedDetailsLink()
                  })
                } else {
                  it("doesn't show indeterminate or extended details link", () => {
                    checkLinkDoesntExist(indeterminateOrExtendedDetailsLinkText)
                  })
                }
              }
            )
          })
        })
      })
    })

    context('personal details', () => {
      const addressDetailsLinkText = 'Address'

      function checkPersonalDetailsLink() {
        checkLink(
          'Personal details',
          `/recommendations/${recommendationId}/personal-details?fromPageId=task-list&fromAnchor=heading-person-details`
        )
      }

      function checkOffenceDetailsLink() {
        checkLink(
          'Offence details',
          `/recommendations/${recommendationId}/offence-details?fromPageId=task-list&fromAnchor=heading-person-details`
        )
      }

      function checkOffenceAnalysisLink() {
        checkLink(
          'Offence analysis',
          `/recommendations/${recommendationId}/offence-analysis?fromPageId=task-list&fromAnchor=heading-person-details`
        )
      }

      function checkPreviousReleasesLink() {
        checkLink(
          'Previous releases',
          `/recommendations/${recommendationId}/previous-releases?fromPageId=task-list&fromAnchor=heading-person-details`
        )
      }

      function checkPreviousRecallsLink() {
        checkLink(
          `Previous recalls`,
          `/recommendations/${recommendationId}/previous-recalls?fromPageId=task-list&fromAnchor=heading-person-details`
        )
      }

      function checkAddressDetailsLink() {
        checkLink(
          addressDetailsLinkText,
          `/recommendations/${recommendationId}/address-details?fromPageId=task-list&fromAnchor=heading-person-details`
        )
      }

      ;[true, false].forEach(isInCustody => {
        context(`person on probations is ${isInCustody ? '' : ' not '}in custody`, () => {
          const recommendation = RecommendationResponseGenerator.generate({
            custodyStatus: isInCustody,
          })
          beforeEach(() => {
            setUp(recommendation)
          })
          it('shows personal details link', () => {
            checkPersonalDetailsLink()
          })
          it('shows offence details link', () => {
            checkOffenceDetailsLink()
          })
          it('shows offence analysis link', () => {
            checkOffenceAnalysisLink()
          })
          it('shows previous releases link', () => {
            checkPreviousReleasesLink()
          })
          it('shows previous recalls link', () => {
            checkPreviousRecallsLink()
          })
          if (!isInCustody) {
            it('shows address details link', () => {
              checkAddressDetailsLink()
            })
          } else {
            it("doesn't show address details link", () => {
              checkLinkDoesntExist(addressDetailsLinkText)
            })
          }
        })
      })
    })

    context('vulnerabilities', () => {
      beforeEach(() => {
        setUp(RecommendationResponseGenerator.generate())
      })
      it('shows vulnerabilities link', () => {
        checkLink(
          'Would recall affect vulnerability or additional needs?',
          `/recommendations/${recommendationId}/vulnerabilities`
        )
      })
    })
  })

  it('task list - check links to forms', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: true, custodyStatus: { selected: 'NO' } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
    cy.getLinkHref('When did the SPO agree this recall?').should('contain', '/recommendations/123/spo-agree-to-recall')
    cy.getLinkHref('Are there any victims in the victim contact scheme?').should(
      'contain',
      '/recommendations/123/victim-contact-scheme'
    )
    cy.getLinkHref('Is Jane Bloggs in custody now?').should(
      'contain',
      '/recommendations/123/custody-status?fromPageId=task-list&fromAnchor=heading-custody'
    )
    cy.getLinkHref('Local police contact details').should('contain', '/recommendations/123/police-details')
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
