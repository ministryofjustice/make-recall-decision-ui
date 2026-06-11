import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import taskListNoRecallController from './taskListNoRecallController'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import ppPaths from '../../routes/paths/pp.paths'
import { recallTypeFTR56 } from '../recommendations/recallType/formOptions'
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

  it('present - task-list-no-recall if recall type set to NO_RECALL', async () => {
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
    // FTR56 is by default enabled
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/${ppPaths.taskListConsiderRecall}`)
  })

  it('present - redirect to task-list-consider-recall if recall type is undefined and FTR56 enabled', async () => {
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

  it('present - redirect to task-list-consider-recall if selected recall type is undefined and FTR56 enabled', async () => {
    const recommendation: Partial<RecommendationResponse> = {
      crn: 'X1213',
      recallType: {
        selected: undefined,
        allOptions: recallTypeFTR56,
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

  it('ftr56: present for Adult_SDS SentenceGroup', async () => {
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

  it('ftr56: present for Youth_SDS SentenceGroup', async () => {
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

  it('ftr56: present for Extended SentenceGroup', async () => {
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

  it('ftr56: present for Indeterminate SentenceGroup', async () => {
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
