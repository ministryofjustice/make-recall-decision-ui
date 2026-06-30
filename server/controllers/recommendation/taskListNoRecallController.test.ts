import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import taskListNoRecallController from './taskListNoRecallController'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import ppPaths from '../../routes/paths/pp.paths'
import recallType from '../recommendations/recallType/formOptions'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

describe('get', () => {
  it('present', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskListNoRecall' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskListNoRecall')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual('recall-type')
    expect(next).toHaveBeenCalled()
  })

  it('present - redirect to task-list-consider-recall if recall type no set to NO_RECALL', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'FIXED_TERM' } },
    }

    const res = mockRes({
      locals: {
        recommendation,
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/${ppPaths.taskListConsiderRecall}`)
  })

  it('present - redirect to task-list-consider-recall if recall type is undefined', async () => {
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
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/${ppPaths.taskListConsiderRecall}`)
  })

  it('present - redirect to task-list-consider-recall if selected recall type is undefined', async () => {
    const recommendation: Partial<RecommendationResponse> = {
      crn: 'X1213',
      recallType: {
        selected: undefined,
        allOptions: recallType,
      },
    }

    const res = mockRes({
      locals: {
        recommendation,
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/${ppPaths.taskListConsiderRecall}`)
  })

  it('present for indeterminate', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
      sentenceGroup: SentenceGroup.INDETERMINATE,
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual('recall-type-indeterminate')
  })

  it('present for extended', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
      sentenceGroup: SentenceGroup.EXTENDED,
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual('recall-type-extended')
  })

  it('present for Adult_SDS SentenceGroup', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
      sentenceGroup: SentenceGroup.ADULT_SDS,
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual('recall-type')
  })

  it('present for Youth_SDS SentenceGroup', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
      sentenceGroup: SentenceGroup.YOUTH_SDS,
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual('recall-type')
  })

  it('present for Extended SentenceGroup', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
      sentenceGroup: SentenceGroup.EXTENDED,
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual('recall-type-extended')
  })

  it('present for Indeterminate SentenceGroup', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
      sentenceGroup: SentenceGroup.INDETERMINATE,
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.locals.whatDoYouRecommendPageUrlSlug).toEqual('recall-type-indeterminate')
  })
})
