import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import redirectController from './redirectController'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('redirect to response-to-probation', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: { recallType: undefined },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-consider-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to consider-recall-task-list', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: { recallType: undefined },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-consider-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: {
              value: 'STANDARD',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list-no-recall', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: {
              value: 'NO_RECALL',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-no-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to spo-task-list-consider-recall by default if spo', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MAKE_RECALL_DECISION_SPO'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/spo-task-list-consider-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to recall-type-extended if extended sentence and spo has recorded decision', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isExtendedSentence: true,
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/recall-type-extended')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to recall-type-indeterminate if indeterminate sentence and spo has recorded decision', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: true,
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/recall-type-indeterminate')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to suitability-for-fixed-term-recall if not indeterminate or extended sentence and spo has recorded decision', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: false,
          isExtendedSentence: false,
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/suitability-for-fixed-term-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list-no-recall if SPO_CONSIDER_RECALL', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_CONSIDER_RECALL, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: {
              value: 'NO_RECALL',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-no-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list if SPO_SIGNATURE_REQUESTED', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_SIGNATURE_REQUESTED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: {
              value: 'STANDARD',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: [HMPPS_AUTH_ROLE.SPO],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list if ACO_SIGNATURE_REQUESTED', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.ACO_SIGNATURE_REQUESTED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: {
              value: 'STANDARD',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: [HMPPS_AUTH_ROLE.SPO],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to is-indeterminate if AP_RECORDED_RATIONALE and is indeterminate not set', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.AP_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {},
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/is-indeterminate')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to is-extended if AP_RECORDED_RATIONALE and is extended not set', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.AP_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: true,
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/is-extended')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to recall-type-indeterminate if AP_RECORDED_RATIONALE and is indeterminate', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.AP_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: true,
          isExtendedSentence: true,
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/recall-type-indeterminate')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to recall-type-extended if AP_RECORDED_RATIONALE and is extended', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.AP_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: false,
          isExtendedSentence: true,
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/recall-type-extended')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to recall-type if AP_RECORDED_RATIONALE and is standard', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.AP_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: false,
          isExtendedSentence: false,
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/recall-type')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list-no-recall if AP_RECORDED_RATIONALE', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.AP_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: false,
          isExtendedSentence: false,
          recallType: {
            selected: {
              value: 'NO_RECALL',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-no-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list if AP_RECORDED_RATIONALE', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.AP_RECORDED_RATIONALE, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: false,
          isExtendedSentence: false,
          recallType: {
            selected: {
              value: 'STANDARD',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list')
    expect(next).toHaveBeenCalled()
  })
})
