import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import taskListController from './taskListController'
import { getStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  const recommendationTemplate = {
    custodyStatus: {
      selected: 'NO',
    },
    localPoliceContact: {
      contactName: 'Inspector Gadget',
    },
    crn: 'X098092',
    recallType: {
      selected: { value: 'STANDARD' },
    },
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
      name: 'Harry Smith',
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
      selected: [{ value: 'NONE' }],
    },
    convictionDetail: { hasBeenReviewed: true },
    offenceAnalysis: 'text',
    isMainAddressWherePersonCanBeFound: { selected: true },
    previousReleases: { hasBeenReleasedPreviously: false },
    previousRecalls: { hasBeenRecalledPreviously: false },
    currentRoshForPartA: {},
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
      responseToProbation: true,
      vulnerabilities: true,
      whatLedToRecall: true,
    },
  }

  it('present', async () => {
    const recommendation = { ...recommendationTemplate, offenceAnalysis: null as string }
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
      areAllComplete: false,
      statuses: { ...taskCompleteness.statuses, offenceAnalysis: false },
    })
    expect(next).toHaveBeenCalled()

    expect(res.locals.lineManagerCountersignLink).toEqual(false)
    expect(res.locals.seniorManagerCountersignLink).toEqual(false)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Cannot start yet')
    expect(res.locals.lineManagerCountersignStyle).toEqual('grey')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
    expect(res.locals.isSpo).toEqual(false)
  })

  it('present - task-list-no-recall if recall type set to NO_RECALL', async () => {
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

  it('present - response to probation if no recall type set', async () => {
    const recommendation = {
      crn: 'X1213',
    }

    const res = mockRes({
      locals: {
        recommendation,
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/response-to-probation')
  })

  it('present - tasks complete', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const recommendation = { ...recommendationTemplate }
    const res = mockRes({
      locals: {
        recommendation,
        flags: { flagTriggerWork: true },
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({ ...taskCompleteness, areAllComplete: false })

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
        flags: { flagTriggerWork: true },
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({ ...taskCompleteness, areAllComplete: false })

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
    const recommendation = { ...recommendationTemplate }
    const res = mockRes({
      locals: {
        recommendation,
        flags: { flagTriggerWork: true },
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({ ...taskCompleteness, areAllComplete: false })

    expect(res.locals.lineManagerCountersignLink).toEqual(true)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Completed')
    expect(res.locals.lineManagerCountersignStyle).toEqual('blue')

    expect(res.locals.seniorManagerCountersignLink).toEqual(true)
    expect(res.locals.seniorManagerCountersignLabel).toEqual('To do')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('grey')
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
        flags: { flagTriggerWork: true },
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual({ ...taskCompleteness, areAllComplete: false })

    expect(res.locals.lineManagerCountersignLink).toEqual(true)
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
        flags: { flagTriggerWork: true },
        user: { roles: ['ROLE_MAKE_RECALL_DECISION'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskList' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskList')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.taskCompleteness).toEqual(taskCompleteness)

    expect(res.locals.lineManagerCountersignLink).toEqual(true)
    expect(res.locals.lineManagerCountersignLabel).toEqual('Completed')
    expect(res.locals.lineManagerCountersignStyle).toEqual('blue')

    expect(res.locals.seniorManagerCountersignLink).toEqual(true)
    expect(res.locals.seniorManagerCountersignLabel).toEqual('Completed')
    expect(res.locals.seniorManagerCountersignStyle).toEqual('blue')
  })
  it('present - with spo role', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const recommendation = { ...recommendationTemplate }
    const res = mockRes({
      locals: {
        recommendation,
        flags: { flagTriggerWork: true },
        user: { roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] },
      },
    })
    const next = mockNext()
    await taskListController.get(mockReq(), res, next)

    expect(res.locals.isSpo).toEqual(true)
  })
})
