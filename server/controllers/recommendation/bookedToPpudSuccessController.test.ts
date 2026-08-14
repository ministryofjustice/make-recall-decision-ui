import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import CUSTODY_GROUP from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import bookedToPpudSuccessController from './bookedToPpudSuccessController'

describe('get', () => {
  it('load - existing determinate sentence', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            ppudSentenceId: '12345',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
        },
      },
    })

    const next = mockNext()

    await bookedToPpudSuccessController.get(mockReq(), res, next)

    expect(res.locals.isNewSentence).toBe(false)
    expect(res.locals.isInDeterminateSentences).toBe(false)
    expect(res.locals.page).toEqual({ id: 'bookedToPpudSuccess' })

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudSuccess')
    expect(next).toHaveBeenCalled()
  })

  it('load - new determinate sentence', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            ppudSentenceId: 'ADD_NEW',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
        },
      },
    })

    const next = mockNext()

    await bookedToPpudSuccessController.get(mockReq(), res, next)

    expect(res.locals.isNewSentence).toBe(true)
    expect(res.locals.isInDeterminateSentences).toBe(false)
    expect(res.locals.page).toEqual({ id: 'bookedToPpudSuccess' })

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudSuccess')
    expect(next).toHaveBeenCalled()
  })

  it('load - existing indeterminate sentence', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            ppudSentenceId: '12345',
            custodyGroup: CUSTODY_GROUP.INDETERMINATE,
          },
        },
      },
    })

    const next = mockNext()

    await bookedToPpudSuccessController.get(mockReq(), res, next)

    expect(res.locals.isNewSentence).toBe(false)
    expect(res.locals.isInDeterminateSentences).toBe(true)
    expect(res.locals.page).toEqual({ id: 'bookedToPpudSuccess' })

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudSuccess')
    expect(next).toHaveBeenCalled()
  })

  it('load - no bookRecallToPpud', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: undefined,
        },
      },
    })

    const next = mockNext()

    await bookedToPpudSuccessController.get(mockReq(), res, next)

    expect(res.locals.isNewSentence).toBe(false)
    expect(res.locals.isInDeterminateSentences).toBe(false)
    expect(res.locals.page).toEqual({ id: 'bookedToPpudSuccess' })

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudSuccess')
    expect(next).toHaveBeenCalled()
  })
})
