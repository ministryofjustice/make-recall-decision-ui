import { fakerEN } from '@faker-js/faker'
import { routeUrls } from '../../server/routes/routeUrls'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import { setResponsePropertiesToNull } from '../support/commands'
import { RecommendationResponse } from '../../server/@types/make-recall-decision-api'
import { RecallTypeSelectedValue } from '../../server/@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import { RECOMMENDATION_STATUS } from '../../server/middleware/recommendationStatus'
import recallTypeValues = RecallTypeSelectedValue.value

context('Recommendation - task list', () => {
  beforeEach(() => {
    cy.signIn()
  })

  function setUp(recResponse: RecommendationResponse, statusesResponse?: { name: string; active: boolean }[]) {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: recResponse,
    })
    cy.task('getStatuses', { statusCode: 200, response: statusesResponse ?? [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)
  }

  const linkTexts = {
    vulnerabilities: 'Would recall affect vulnerability or additional needs?',
  }

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

  context('form links', () => {
    function checkLink(linkText: string, url: string) {
      cy.getLinkHref(linkText).should('contain', url)
    }

    function checkElementDoesntExist(elementText: string) {
      cy.getElement(elementText).should('not.exist')
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
                    checkElementDoesntExist(suitabilityLinkText)
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
                    checkElementDoesntExist(whatHasLedToRecallLinkText)
                  })
                }
                if (isRecall && !isIndeterminateSentence) {
                  it('shows emergency recall link', () => {
                    checkEmergencyRecallLink()
                  })
                } else {
                  it("doesn't show emergency recall link", () => {
                    checkElementDoesntExist(emergencyRecallLinkText)
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
                    checkElementDoesntExist(indeterminateTypeLinkText)
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
                    checkElementDoesntExist(ftrAdditionalLicenceConditionsLinkText)
                  })
                }
                if (isRecall && (isIndeterminateSentence || isExtendedSentence)) {
                  it('shows indeterminate or extended details link', () => {
                    checkIndeterminateOrExtendedDetailsLink()
                  })
                } else {
                  it("doesn't show indeterminate or extended details link", () => {
                    checkElementDoesntExist(indeterminateOrExtendedDetailsLinkText)
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
              checkElementDoesntExist(addressDetailsLinkText)
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
        checkLink(linkTexts.vulnerabilities, `/recommendations/${recommendationId}/vulnerabilities`)
      })
    })

    context('victims liaison', () => {
      beforeEach(() => {
        setUp(RecommendationResponseGenerator.generate())
      })
      it('shows victims liaison link', () => {
        checkLink(
          'Are there any victims in the victim contact scheme?',
          `/recommendations/${recommendationId}/victim-contact-scheme`
        )
      })
    })

    context('custody details', () => {
      const personName = fakerEN.person.fullName()

      const arrestIssuesLinkText = `Is there anything the police should know before they arrest ${personName}?`

      function checkCustodyStatusLink(personOnProbationName: string) {
        checkLink(
          `Is ${personOnProbationName} in custody now?`,
          `/recommendations/${recommendationId}/custody-status?fromPageId=task-list&fromAnchor=heading-custody`
        )
      }

      function checkPoliceDetailsLink() {
        checkLink('Local police contact details', `/recommendations/${recommendationId}/police-details`)
      }

      function checkIsUnderIOMLink(personOnProbationName: string) {
        checkLink(
          `Is ${personOnProbationName} under Integrated Offender Management (IOM)?`,
          `/recommendations/${recommendationId}/iom`
        )
      }

      function checkArrestIssuesLink() {
        checkLink(arrestIssuesLinkText, `/recommendations/${recommendationId}/arrest-issues`)
      }

      function checkContrabandLink(personOnProbationName: string) {
        checkLink(
          `Do you think ${personOnProbationName} is using recall to bring contraband into prison?`,
          `/recommendations/${recommendationId}/contraband`
        )
      }

      ;[true, false].forEach(isInCustody => {
        context(`person on probations is ${isInCustody ? '' : ' not '}in custody`, () => {
          const recommendation = RecommendationResponseGenerator.generate({
            custodyStatus: isInCustody,
            personOnProbation: {
              name: personName,
            },
          })
          recommendation.personOnProbation.name = personName
          beforeEach(() => {
            setUp(recommendation)
          })
          it('shows custody status link', () => {
            checkCustodyStatusLink(recommendation.personOnProbation.name)
          })
          it('shows police details link', () => {
            checkPoliceDetailsLink()
          })
          it('shows is under IOM link', () => {
            checkIsUnderIOMLink(recommendation.personOnProbation.name)
          })
          if (!isInCustody) {
            it('shows arrest issues link', () => {
              checkArrestIssuesLink()
            })
          } else {
            it("doesn't show arrest issues link", () => {
              checkElementDoesntExist(arrestIssuesLinkText)
            })
          }
          it('shows contraband link', () => {
            checkContrabandLink(recommendation.personOnProbation.name)
          })
        })
      })
    })

    context('risk profile details', () => {
      function checkRoshLink() {
        checkLink(
          `Indicative risk assessment pending OASys review`,
          `/recommendations/${recommendationId}/rosh?fromPageId=task-list&fromAnchor=heading-risk-profile`
        )
      }

      function checkMappaLink(personOnProbationName: string) {
        checkLink(
          `MAPPA for ${personOnProbationName}`,
          `/recommendations/${recommendationId}/mappa?fromPageId=task-list&fromAnchor=heading-risk-profile`
        )
      }

      const recommendation = RecommendationResponseGenerator.generate()
      beforeEach(() => {
        return setUp(recommendation)
      })
      it('shows rosh link', () => {
        checkRoshLink()
      })
      it('shows mappa link', () => {
        checkMappaLink(recommendation.personOnProbation.name)
      })
    })

    context('contact information details', () => {
      const personName = fakerEN.person.fullName()

      const practitionerForPartALinkText = `Practitioner for ${personName}?`

      function checkWhoCompletedPartALink() {
        checkLink('Who completed this Part A?', `/recommendations/${recommendationId}/who-completed-part-a`)
      }

      function checkPractitionerForPartALink() {
        checkLink(practitionerForPartALinkText, `/recommendations/${recommendationId}/practitioner-for-part-a`)
      }

      function checkRevocationOrderRecipientsLink() {
        checkLink(
          'Where should the revocation order be sent?',
          `/recommendations/${recommendationId}/revocation-order-recipients`
        )
      }

      function checkPPCSQueryEmailsLink() {
        checkLink('Where should PPCS respond with questions?', `/recommendations/${recommendationId}/ppcs-query-emails`)
      }

      context('recommendation with no details completed for who completed part A', () => {
        const recommendation = RecommendationResponseGenerator.generate({
          personOnProbation: {
            name: personName,
          },
          whoCompletedPartA: 'none',
        })
        beforeEach(() => setUp(recommendation))
        it('shows who completed part A link', () => {
          checkWhoCompletedPartALink()
        })
        it("doesn't show practitioner for part A link", () => {
          checkElementDoesntExist(practitionerForPartALinkText)
        })
        it('shows revocation order recipients link', () => {
          checkRevocationOrderRecipientsLink()
        })
        it('shows PPCS query e-mails link', () => {
          checkPPCSQueryEmailsLink()
        })
      })

      context('recommendation with part A completed by practitioner', () => {
        const recommendation = RecommendationResponseGenerator.generate({
          personOnProbation: {
            name: personName,
          },
          whoCompletedPartA: {
            isPersonProbationPractitionerForOffender: true,
          },
        })
        beforeEach(() => setUp(recommendation))
        it('shows who completed part A link', () => {
          checkWhoCompletedPartALink()
        })
        it("doesn't show practitioner for part A link", () => {
          checkElementDoesntExist(practitionerForPartALinkText)
        })
        it('shows revocation order recipients link', () => {
          checkRevocationOrderRecipientsLink()
        })
        it('shows PPCS query e-mails link', () => {
          checkPPCSQueryEmailsLink()
        })
      })

      context('recommendation with part A not completed by practitioner', () => {
        const recommendation = RecommendationResponseGenerator.generate({
          personOnProbation: {
            name: personName,
          },
          whoCompletedPartA: {
            isPersonProbationPractitionerForOffender: false,
          },
        })
        beforeEach(() => setUp(recommendation))
        it('shows who completed part A link', () => {
          checkWhoCompletedPartALink()
        })
        it('shows practitioner for part A link', () => {
          checkPractitionerForPartALink()
        })
        it('shows revocation order recipients link', () => {
          checkRevocationOrderRecipientsLink()
        })
        it('shows PPCS query e-mails link', () => {
          checkPPCSQueryEmailsLink()
        })
      })
    })

    context('countersignature details', () => {
      const requestSpoCountersignatureLinkText = "Request line manager's countersignature"
      const requestAcoCountersignatureLinkText = "Request senior manager's countersignature"

      function checkRequestSpoCountersignatureLink() {
        checkLink(
          requestSpoCountersignatureLinkText,
          `/recommendations/${recommendationId}/request-spo-countersign?fromPageId=task-list&fromAnchor=countersign`
        )
      }

      function checkRequestAcoCountersignatureLink() {
        checkLink(
          requestAcoCountersignatureLinkText,
          `/recommendations/${recommendationId}/request-aco-countersign?fromPageId=task-list&fromAnchor=countersign`
        )
      }

      function checkCountersignatureTextHasNoLink(elementText: string) {
        // The text should still appear, it just shouldn't have a link to the countersignature page
        cy.getElement(elementText).should('not.have.attr', 'href')
      }

      context('recommendation not ready for any countersignature', () => {
        beforeEach(() => {
          setUp(
            RecommendationResponseGenerator.generate({
              personOnProbation: {
                hasBeenReviewed: false,
              },
            })
          )
        })
        it("SPO countersignature text doesn't have a link", () => {
          checkCountersignatureTextHasNoLink(requestSpoCountersignatureLinkText)
        })
        it("ACO countersignature text doesn't have a link", () => {
          checkCountersignatureTextHasNoLink(requestAcoCountersignatureLinkText)
        })
      })

      // The requirements for countersignature is a much longer list than the value set below, but most of them are
      // satisfied by the default recommendation produced by the generator. We only set here the ones that aren't
      // guaranteed (e.g. they are normally random boolean values)
      const recommendationReadyForCountersignature = RecommendationResponseGenerator.generate({
        recallType: {
          selected: {
            value: fakerEN.helpers.arrayElement([recallTypeValues.FIXED_TERM, recallTypeValues.STANDARD]),
          },
        },
        personOnProbation: {
          hasBeenReviewed: true,
          mappa: {
            hasBeenReviewed: true,
          },
        },
        convictionDetail: {
          hasBeenReviewed: true,
        },
      })

      context('recommendation ready for SPO countersignature', () => {
        beforeEach(() => {
          setUp(recommendationReadyForCountersignature, [
            {
              name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED,
              active: true,
            },
          ])
        })
        it('shows SPO countersignature link', () => {
          checkRequestSpoCountersignatureLink()
        })
        it("ACO countersignature text doesn't have a link", () => {
          checkCountersignatureTextHasNoLink(requestAcoCountersignatureLinkText)
        })
      })

      context('recommendation ready for ACO countersignature', () => {
        beforeEach(() => {
          setUp(recommendationReadyForCountersignature, [
            {
              name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED,
              active: true,
            },
          ])
        })
        it("SPO countersignature text doesn't have a link", () => {
          checkCountersignatureTextHasNoLink(requestSpoCountersignatureLinkText)
        })
        it('shows ACO countersignature link', () => {
          checkRequestAcoCountersignatureLink()
        })
      })

      context('recommendation fully countersigned', () => {
        beforeEach(() => {
          setUp(recommendationReadyForCountersignature, [{ name: RECOMMENDATION_STATUS.ACO_SIGNED, active: true }])
        })
        it("SPO countersignature text doesn't have a link", () => {
          checkCountersignatureTextHasNoLink(requestSpoCountersignatureLinkText)
        })
        it("ACO countersignature text doesn't have a link", () => {
          checkCountersignatureTextHasNoLink(requestAcoCountersignatureLinkText)
        })
      })
    })
  })

  context('form completion labels', () => {
    function hasExpectedLabel(formElementText: string, labelText: string) {
      cy.getElement(`${formElementText} ${labelText}`).should('exist')
    }

    function hasToDoLabel(formElementText: string) {
      hasExpectedLabel(formElementText, 'To do')
    }

    function hasCompletedLabel(formElementText: string) {
      hasExpectedLabel(formElementText, 'Completed')
    }

    context('vulnerabilities', () => {
      context('no vulnerabilities selected', () => {
        beforeEach(() => {
          setUp(
            RecommendationResponseGenerator.generate({
              vulnerabilities: 'none',
            })
          )
        })
        it("shows vulnerabilities with 'To do' label", () => {
          hasToDoLabel(linkTexts.vulnerabilities)
        })
      })

      context('vulnerabilities selected', () => {
        beforeEach(() => {
          setUp(RecommendationResponseGenerator.generate())
        })
        it("shows vulnerabilities with 'Completed' label", () => {
          hasCompletedLabel(linkTexts.vulnerabilities)
        })
      })
    })
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
