import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import taskListController from './taskListController'
import { getStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import config from '../../config'
import { VULNERABILITY } from '../recommendations/vulnerabilities/formOptions'
import { vulnerabilityRequiresDetails } from '../recommendations/vulnerabilitiesDetails/formValidator'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/vulnerabilitiesDetails/formValidator')

describe('get', () => {
  const recommendationTemplate = {
    custodyStatus: {
      selected: 'NO',
    },
    localPoliceContact: {
      contactName: 'Joe Bloggs',
    },
    crn: 'X098092',
    recallType: {
      selected: { value: 'STANDARD' },
    },
    decisionDateTime: '2021-01-01T12:00:00',
    responseToProbation: 'text',
    whatLedToRecall: 'text',
    isThisAnEmergencyRecall: false,
    isIndeterminateSentence: false,
    isExtendedSentence: false,
    activeCustodialConvictionCount: 1,
    hasVictimsInContactScheme: {
      selected: 'NO',
    },
    indeterminateSentenceType: { selected: 'NO' },
    hasArrestIssues: { selected: false },
    hasContrabandRisk: { selected: false },
    personOnProbation: {
      name: 'Joe Bloggs',
      mappa: { hasBeenReviewed: true },
      hasBeenReviewed: true,
    },
    alternativesToRecallTried: {
      selected: [{ value: 'NONE' }],
    },
    licenceConditionsBreached: {
      standardLicenceConditions: {
        selected: ['GOOD_BEHAVIOUR'],
      },
    },
    isUnderIntegratedOffenderManagement: { selected: 'NO' },
    vulnerabilities: {
      selected: [{ value: VULNERABILITY.DRUG_OR_ALCOHOL_USE }],
    },
    convictionDetail: { hasBeenReviewed: true },
    offenceAnalysis: 'text',
    isMainAddressWherePersonCanBeFound: { selected: true },
    previousReleases: { hasBeenReleasedPreviously: false },
    previousRecalls: { hasBeenRecalledPreviously: false },
    currentRoshForPartA: {},
    whoCompletedPartA: {
      name: 'john',
      email: 'john@me.com',
      telephone: '123456',
      region: 'region A',
      localDeliveryUnit: 'here',
      isPersonProbationPractitionerForOffender: true,
    },
    practitionerForPartA: {
      name: 'jane',
      email: 'jane@me.com',
      telephone: '55555',
      region: 'region A',
      localDeliveryUnit: 'here',
      isPersonProbationPractitionerForOffender: true,
    },
    revocationOrderRecipients: ['here@me.com'],
    ppcsQueryEmails: ['bob@me.com'],
  }

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
      isExtendedSentence: true,
      isIndeterminateSentence: true,
      isMainAddressWherePersonCanBeFound: true,
      isThisAnEmergencyRecall: true,
      isUnderIntegratedOffenderManagement: true,
      licenceConditionsBreached: true,
      localPoliceContact: true,
      mappa: true,
      offenceAnalysis: true,
      personOnProbation: true,
      previousRecalls: true,
      previousReleases: true,
      recallType: true,
      decisionDateTime: true,
      responseToProbation: true,
      vulnerabilities: true,
      whatLedToRecall: true,
      fixedTermAdditionalLicenceConditions: true,
      indeterminateOrExtendedSentenceDetails: true,
      indeterminateSentenceType: false,
      didProbationPractitionerCompletePartA: true,
      practitionerForPartA: true,
      whoCompletedPartA: true,
      ppcsQueryEmails: true,
      revocationOrderRecipients: true,
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

    expect(vulnerabilityRequiresDetails).not.toHaveBeenCalled()

    expect(res.locals.lineManagerCountersignLink).toEqual(false)
    expect(res.locals.seniorManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.lineManagerCountersignStyle).toEqual('grey')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
    expect(res.locals.isSpo).toEqual(false)
    expect(res.locals.shareLink).toEqual(`${config.domain}/recommendations/123/task-list`)
    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual(`recall-type`)
    expect(res.locals.selectedVulnerabilitiesRequireDetails).not.toBeDefined()
  })

  it('present for indeterminate', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const recommendation = { ...recommendationTemplate, isIndeterminateSentence: true }
    const res = mockRes({
      locals: {
        recommendation,
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual(`recall-type-indeterminate`)
  })

  it('present for extended', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const recommendation = { ...recommendationTemplate, isExtendedSentence: true }
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
  describe('when riskToSelf flag enabled', () => {
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
            flags: { flagRiskToSelfEnabled: true },
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
        (vulnerability: VULNERABILITY) => vulnerability === vulnerability1
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
          flags: { flagRiskToSelfEnabled: true },
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
          flags: { flagRiskToSelfEnabled: true },
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
          flags: { flagRiskToSelfEnabled: true },
        },
      })
      const next = mockNext()
      await taskListController.get(mockReq(), res, next)

      expect(res.locals.selectedVulnerabilitiesRequireDetails).toEqual(false)
    })
  })
})
