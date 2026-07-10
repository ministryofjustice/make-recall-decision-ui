import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import taskListController from './taskListController'
import { getStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import config from '../../config'
import { VULNERABILITY } from '../recommendations/vulnerabilities/formOptions'
import { vulnerabilityRequiresDetails } from '../recommendations/vulnerabilitiesDetails/formValidator'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { CustodyStatus } from '../../@types/make-recall-decision-api/models/CustodyStatus'
import selected = CustodyStatus.selected
import { RecallTypeSelectedValue } from '../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { IsRecalledOnNewChargedOrConvictedOffence } from '../../@types/make-recall-decision-api/models/IsRecalledOnNewChargedOrConvictedOffence'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/vulnerabilitiesDetails/formValidator')

describe('get', () => {
  const recommendationTemplate = RecommendationResponseGenerator.generate({
    recallType: {
      selected: {
        value: RecallTypeSelectedValue.value.FIXED_TERM,
      },
    },
    sentenceGroup: SentenceGroup.ADULT_SDS,
    alternativesToRecallTried: true,
    decisionDateTime: true,
    triggerLeadingToRecall: false,
    previousReleases: true,
    licenceConditionsBreached: true,
    isChargedWithOffence: true,
    personOnProbation: {
      name: 'Jane Bloggs',
      hasBeenReviewed: true,
      mappa: {
        hasBeenReviewed: true,
      },
      ftr56MappaReviewed: true,
    },
    indexOffenceDetails: true,
    convictionDetail: {
      hasBeenReviewed: true,
    },
    offenceAnalysis: true,
    custodyStatus: {
      selected: selected.YES_POLICE,
      details: faker.location.streetAddress(),
      allOptions: [],
    },

    indeterminateOrExtendedSentenceDetails: false,
    practitionerForPartA: true,
    whoCompletedPartA: {
      isPersonProbationPractitionerForOffender: true,
    },
    whatLedToRecall: true,
    isThisAnEmergencyRecall: true,
    isServingTerroristOrNationalSecurityOffence: true,
    isAtRiskOfInvolvedInForeignPowerThreat: true,
    wasReferredToParoleBoard244ZB: true,
    wasRepatriatedForMurder: true,
    isServingSOPCSentence: true,
    isServingDCRSentence: true,
    isYouthSentenceOver12Months: true,
    isYouthChargedWithSeriousOffence: true,
  })

  const taskCompleteness = {
    areAllComplete: true,
    statuses: {
      alternativesToRecallTried: true,
      convictionDetail: true,
      currentRoshForPartA: true,
      custodyStatus: true,
      hasArrestIssues: true,
      hasContrabandRisk: true,
      hasVictimsInContactScheme: true,
      sentenceGroup: true,
      triggerLeadingToRecall: false,
      isMainAddressWherePersonCanBeFound: true,
      isThisAnEmergencyRecall: true,
      licenceConditionsBreached: true,
      localPoliceContact: true,
      mappa: true,
      offenceAnalysis: true,
      personOnProbation: true,
      previousReleases: true,
      recallType: true,
      decisionDateTime: true,
      vulnerabilities: true,
      whatLedToRecall: true,
      fixedTermAdditionalLicenceConditions: true,
      indeterminateOrExtendedSentenceDetails: false,
      didProbationPractitionerCompletePartA: true,
      practitionerForPartA: true,
      whoCompletedPartA: true,
      ppcsQueryEmails: true,
      revocationOrderRecipients: true,
      isChargedWithOffence: true,
      isServingTerroristOrNationalSecurityOffence: true,
      isAtRiskOfInvolvedInForeignPowerThreat: true,
      wasReferredToParoleBoard244ZB: true,
      wasRepatriatedForMurder: true,
      isServingSOPCSentence: true,
      isServingDCRSentence: true,
      isYouthSentenceOver12Months: true,
      isYouthChargedWithSeriousOffence: true,
    },
  }

  it('present', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const recommendation = { ...recommendationTemplate, offenceAnalysis: null as string }
    const res = mockRes({
      locals: {
        recommendation,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.locals.isAcoSigned).toEqual(false)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({
      isReadyForCounterSignature: false,
      areAllComplete: false,
      statuses: { ...taskCompleteness.statuses, offenceAnalysis: false },
    })
    expect(next).toHaveBeenCalled()

    expect(vulnerabilityRequiresDetails).toHaveBeenCalled()

    expect(res.locals.lineManagerCountersignLink).toEqual(false)
    expect(res.locals.seniorManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.lineManagerCountersignStyle).toEqual('grey')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
    expect(res.locals.isSpo).toEqual(false)
    expect(res.locals.shareLink).toEqual(`${config.domain}/recommendations/123/task-list`)
    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual(`recall-type`)
    expect(res.locals.selectedVulnerabilitiesRequireDetails).toBeDefined()
  })

  it('present for extended', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const recommendation = { ...recommendationTemplate, sentenceGroup: SentenceGroup.EXTENDED }
    const res = mockRes({
      locals: {
        recommendation,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual(`recall-type-extended`)
  })

  it('present - task-list-no-recall if recall type set to NO_RECALL', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.NO_RECALL_DECIDED, active: true }])
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
    }

    const res = mockRes({
      locals: {
        recommendation,
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/task-list-no-recall')
  })

  it('present - tasks complete', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])

    const res = mockRes({
      locals: {
        recommendation: recommendationTemplate,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })

    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendationTemplate)
    expect(res.locals.taskCompleteness).toEqual({
      ...taskCompleteness,
      isReadyForCounterSignature: true,
      areAllComplete: false,
    })

    expect(res.locals.lineManagerCountersignLink).toEqual(true)
    expect(res.locals.seniorManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('To do')
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.lineManagerCountersignStyle).toEqual('grey')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
  })

  it('present - tasks complete and SPO signature requested', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_SIGNATURE_REQUESTED, active: true }])
    const recommendation = { ...recommendationTemplate }
    const res = mockRes({
      locals: {
        recommendation,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({
      ...taskCompleteness,
      isReadyForCounterSignature: true,
      areAllComplete: false,
    })

    expect(res.locals.lineManagerCountersignLink).toEqual(true)
    expect(res.locals.seniorManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Requested')
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.lineManagerCountersignStyle).toEqual('grey')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
  })
  it('present - tasks complete and SPO signature signed', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      { name: STATUSES.SPO_SIGNATURE_REQUESTED, active: false },
      { name: STATUSES.SPO_SIGNED, active: true },
    ])
    const recommendation = { ...recommendationTemplate, countersignSpoExposition: 'spo reasons' }
    const res = mockRes({
      locals: {
        recommendation,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({
      ...taskCompleteness,
      isReadyForCounterSignature: true,
      areAllComplete: false,
    })

    expect(res.locals.lineManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Completed')
    expect(res.locals.lineManagerCountersignStyle).toEqual('blue')

    expect(res.locals.seniorManagerCountersignLink).toEqual(true)
    expect(res.locals.seniorManagerCountersignLabel).toEqual('To do')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
    expect(res.locals.countersignSpoExposition).toEqual('spo reasons')
  })

  it('present - tasks complete and ACO signature requested', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      { name: STATUSES.SPO_SIGNATURE_REQUESTED, active: false },
      { name: STATUSES.SPO_SIGNED, active: true },
      { name: STATUSES.ACO_SIGNATURE_REQUESTED, active: true },
    ])
    const recommendation = { ...recommendationTemplate }
    const res = mockRes({
      locals: {
        recommendation,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({
      ...taskCompleteness,
      isReadyForCounterSignature: true,
      areAllComplete: false,
    })

    expect(res.locals.lineManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Completed')
    expect(res.locals.lineManagerCountersignStyle).toEqual('blue')

    expect(res.locals.seniorManagerCountersignLink).toEqual(true)
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Requested')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
  })
  it('present - tasks complete and ACO signature signed', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      { name: STATUSES.SPO_SIGNATURE_REQUESTED, active: false },
      { name: STATUSES.SPO_SIGNED, active: true },
      { name: STATUSES.ACO_SIGNATURE_REQUESTED, active: false },
      { name: STATUSES.ACO_SIGNED, active: true },
    ])
    const recommendation = { ...recommendationTemplate }
    const res = mockRes({
      locals: {
        recommendation,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.locals.isAcoSigned).toEqual(true)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({
      ...taskCompleteness,
      isReadyForCounterSignature: true,
      areAllComplete: true,
    })

    expect(res.locals.lineManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Completed')
    expect(res.locals.lineManagerCountersignStyle).toEqual('blue')

    expect(res.locals.seniorManagerCountersignLink).toEqual(false)
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Completed')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('blue')
  })
  it('present - with spo role', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const recommendation = { ...recommendationTemplate }
    const res = mockRes({
      locals: {
        recommendation,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.isSpo).toEqual(true)
  })

  it('present - tasks complete with ftr56SentenceConviction enabled', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])

    const res = mockRes({
      locals: {
        recommendation: {
          ...recommendationTemplate,
          isRecalledOnNewChargedOrConvictedOffence: {
            selected: IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
          },
        },
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
        flags: {
          ftr56SentenceConviction: true,
        },
      },
    })

    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual({
      ...recommendationTemplate,
      isRecalledOnNewChargedOrConvictedOffence: {
        selected: IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
      },
    })
    expect(res.locals.taskCompleteness).toEqual({
      ...taskCompleteness,
      statuses: {
        ...taskCompleteness.statuses,
        isRecalledOnNewChargedOrConvictedOffence: true,
      },
      isReadyForCounterSignature: true,
      areAllComplete: false,
    })

    expect(res.locals.lineManagerCountersignLink).toEqual(true)
    expect(res.locals.seniorManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('To do')
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.lineManagerCountersignStyle).toEqual('grey')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
  })

  describe('VulnerabilitiesRequireDetails', () => {
    ;[true, false].forEach(expectedSelectedVulnerabilitiesRequireDetails => {
      it(`selectedVulnerabilitiesRequireDetails value set to result of vulnerabilityRequiresDetails call (${expectedSelectedVulnerabilitiesRequireDetails})`, async () => {
        ;(getStatuses as jest.Mock).mockResolvedValue([])
        // the controller calls taskCompleteness, which also uses vulnerabilityRequiresDetails, so we cannot use
        // mockReturnValueOnce here or the calls relevant to this test will return undefined. This can be changed once
        // the controller test is set up to mock taskCompleteness
        ;(vulnerabilityRequiresDetails as jest.Mock).mockReturnValue(expectedSelectedVulnerabilitiesRequireDetails)

        const vulnerability = faker.helpers.enumValue(VULNERABILITY)
        const res = mockRes({
          locals: {
            recommendation: {
              ...recommendationTemplate,
              vulnerabilities: {
                selected: [{ value: vulnerability, details: faker.lorem.sentence() }],
              },
            },
            user: { roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] },
          },
        })
        const next = mockNext()
        await taskListController.get(mockReq(), res, next)

        expect(vulnerabilityRequiresDetails).toHaveBeenCalledWith(vulnerability)

        expect(res.locals.selectedVulnerabilitiesRequireDetails).toEqual(expectedSelectedVulnerabilitiesRequireDetails)
      })
    })
    it('selectedVulnerabilitiesRequireDetails value set to combination of results of vulnerabilityRequiresDetails calls', async () => {
      ;(getStatuses as jest.Mock).mockResolvedValue([])

      const vulnerability1 = faker.helpers.enumValue(VULNERABILITY)
      let vulnerability2: VULNERABILITY
      do {
        vulnerability2 = faker.helpers.enumValue(VULNERABILITY)
      } while (vulnerability1 === vulnerability2)
      ;(vulnerabilityRequiresDetails as jest.Mock).mockImplementation(
        (vulnerability: VULNERABILITY) => vulnerability === vulnerability1,
      )

      const res = mockRes({
        locals: {
          recommendation: {
            ...recommendationTemplate,
            vulnerabilities: {
              selected: [
                { value: vulnerability1, details: faker.lorem.sentence() },
                { value: vulnerability2, details: faker.lorem.sentence() },
              ],
            },
          },
          user: { roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] },
        },
      })
      const next = mockNext()
      await taskListController.get(mockReq(), res, next)

      expect(vulnerabilityRequiresDetails).toHaveBeenCalledWith(vulnerability1)
      expect(vulnerabilityRequiresDetails).toHaveBeenCalledWith(vulnerability2)

      expect(res.locals.selectedVulnerabilitiesRequireDetails).toEqual(true)
    })
    it('selectedVulnerabilitiesRequireDetails value set to false if no vulnerabilities selected', async () => {
      ;(getStatuses as jest.Mock).mockResolvedValue([])

      const res = mockRes({
        locals: {
          recommendation: {
            ...recommendationTemplate,
            vulnerabilities: {
              selected: [],
            },
          },
          user: { roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] },
        },
      })
      const next = mockNext()
      await taskListController.get(mockReq(), res, next)

      expect(res.locals.selectedVulnerabilitiesRequireDetails).toEqual(false)
    })
    it('selectedVulnerabilitiesRequireDetails value set to false if vulnerabilities field not set', async () => {
      ;(getStatuses as jest.Mock).mockResolvedValue([])

      const res = mockRes({
        locals: {
          recommendation: {
            ...recommendationTemplate,
            vulnerabilities: undefined,
          },
          user: { roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] },
        },
      })
      const next = mockNext()
      await taskListController.get(mockReq(), res, next)

      expect(res.locals.selectedVulnerabilitiesRequireDetails).toEqual(false)
    })
  })
})
