import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import checkMappaInformationController from './checkMappaInformationController'
import { MappaGenerator } from '../../../data/common/mappaGenerator'

jest.mock('../../data/makeDecisionApiClient')

const mockMappaData = MappaGenerator.generate()

describe('get', () => {
  it('loads the page correctly', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', isIndeterminateSentence: false, isExtendedSentence: false },
      },
    })

    ;(getCaseSummary as jest.Mock).mockResolvedValue({
      mappa: mockMappaData,
    })

    const next = mockNext()
    await checkMappaInformationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({
      id: 'checkMappaInformation',
    })
    expect(res.locals.mappaData).toEqual(mockMappaData)
    expect(next).toHaveBeenCalled()
  })
})
