import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, getSupportingDocuments, updateStatuses } from '../../data/makeDecisionApiClient'
import bookToPpudController from './bookToPpudController'
import bookOffender from '../../booking/bookOffender'
import createOrUpdateSentence from '../../booking/createOrUpdateSentence'
import updateOffence from '../../booking/updateOffence'
import updateRelease from '../../booking/updateRelease'
import updateRecall from '../../booking/updateRecall'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { StageEnum } from '../../booking/StageEnum'
import uploadMandatoryDocument from '../../booking/uploadMandatoryDocument'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../booking/bookOffender')
jest.mock('../../booking/updateRecall')
jest.mock('../../booking/updateRelease')
jest.mock('../../booking/createOrUpdateSentence')
jest.mock('../../booking/updateOffence')
jest.mock('../../booking/uploadMandatoryDocument')
jest.mock('../../monitoring/azureAppInsights')

describe('get', () => {
  it('load', async () => {
    const recommendation = {
      crn: 'X1213',
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await bookToPpudController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'bookToPpud' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookToPpud')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post - happy path', async () => {
    const recommendation = { id: '12345' }
    const flags = { xyz: true }

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath },
        flags,
      },
    })
    const next = mockNext()

    ;(bookOffender as jest.Mock).mockResolvedValue({ stage: StageEnum.OFFENDER_BOOKED })
    ;(createOrUpdateSentence as jest.Mock).mockResolvedValue({ stage: StageEnum.SENTENCE_BOOKED })
    ;(updateOffence as jest.Mock).mockResolvedValue({ stage: StageEnum.OFFENCE_BOOKED })
    ;(updateRelease as jest.Mock).mockResolvedValue({ stage: StageEnum.RELEASE_BOOKED })
    ;(updateRecall as jest.Mock).mockResolvedValue({ stage: StageEnum.RECALL_BOOKED })

    await bookToPpudController.post(req, res, next)

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['BOOKING_ON_STARTED'],
      deActivate: [],
      recommendationId: '1',
      token: 'token',
    })

    expect(bookOffender).toHaveBeenCalledWith({ stage: StageEnum.STARTED }, recommendation, 'token', flags)
    expect(createOrUpdateSentence).toHaveBeenCalledWith(
      { stage: StageEnum.OFFENDER_BOOKED },
      recommendation,
      'token',
      flags
    )
    expect(updateOffence).toHaveBeenCalledWith({ stage: StageEnum.SENTENCE_BOOKED }, recommendation, 'token', flags)
    expect(updateRelease).toHaveBeenCalledWith({ stage: StageEnum.OFFENCE_BOOKED }, recommendation, 'token', flags)
    expect(updateRecall).toHaveBeenCalledWith({ stage: StageEnum.RELEASE_BOOKED }, recommendation, 'token', flags)

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['BOOKED_TO_PPUD', 'REC_CLOSED'],
      deActivate: [],
      recommendationId: '1',
      token: 'token',
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/booked-to-ppud`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post - happy path - flagSupportingDocuments', async () => {
    const recommendation = { id: '12345' }
    const flags = { flagSupportingDocuments: true }

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath },
        flags,
      },
    })
    const next = mockNext()

    ;(bookOffender as jest.Mock).mockResolvedValue({ stage: StageEnum.OFFENDER_BOOKED })
    ;(createOrUpdateSentence as jest.Mock).mockResolvedValue({ stage: StageEnum.SENTENCE_BOOKED })
    ;(updateOffence as jest.Mock).mockResolvedValue({ stage: StageEnum.OFFENCE_BOOKED })
    ;(updateRelease as jest.Mock).mockResolvedValue({ stage: StageEnum.RELEASE_BOOKED })
    ;(updateRecall as jest.Mock).mockResolvedValue({ stage: StageEnum.RECALL_BOOKED })

    const PPUDPartA = {
      title: '',
      type: 'PPUDPartA',
      filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    const PPUDLicenceDocument = {
      title: '',
      type: 'PPUDLicenceDocument',
      filename: 'licence.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491dff',
    }

    const PPUDProbationEmail = {
      title: '',
      type: 'PPUDProbationEmail',
      filename: 'email.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491daa',
    }

    const PPUDOASys = {
      title: '',
      type: 'PPUDOASys',
      filename: 'email.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491daa',
    }

    const PPUDPrecons = {
      title: '',
      type: 'PPUDPrecons',
      filename: 'email.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491dbb',
    }

    const PPUDPSR = {
      title: '',
      type: 'PPUDPSR',
      filename: 'psr.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491dcc',
    }

    const PPUDChargeSheet = {
      title: '',
      type: 'PPUDChargeSheet',
      filename: 'psr.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491ddd',
    }

    ;(getSupportingDocuments as jest.Mock).mockReturnValueOnce([
      PPUDPartA,
      PPUDLicenceDocument,
      PPUDProbationEmail,
      PPUDOASys,
      PPUDPrecons,
      PPUDPSR,
      PPUDChargeSheet,
    ])
    ;(uploadMandatoryDocument as jest.Mock)
      .mockReturnValueOnce({ stage: StageEnum.PART_A_UPLOADED })
      .mockReturnValueOnce({ stage: StageEnum.LICENCE_DOCUMENT_UPLOADED })
      .mockReturnValueOnce({ stage: StageEnum.PROBATION_EMAIL_UPLOADED })
      .mockReturnValueOnce({ stage: StageEnum.OASYS_UPLOADED })
      .mockReturnValueOnce({ stage: StageEnum.PRECONS_UPLOADED })
      .mockReturnValueOnce({ stage: StageEnum.PSR_UPLOADED })
      .mockReturnValueOnce({ stage: StageEnum.CHARGE_SHEET_UPLOADED })

    await bookToPpudController.post(req, res, next)

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['BOOKING_ON_STARTED'],
      deActivate: [],
      recommendationId: '1',
      token: 'token',
    })

    expect(bookOffender).toHaveBeenCalledWith({ stage: StageEnum.STARTED }, recommendation, 'token', flags)
    expect(createOrUpdateSentence).toHaveBeenCalledWith(
      { stage: StageEnum.OFFENDER_BOOKED },
      recommendation,
      'token',
      flags
    )
    expect(updateOffence).toHaveBeenCalledWith({ stage: StageEnum.SENTENCE_BOOKED }, recommendation, 'token', flags)
    expect(updateRelease).toHaveBeenCalledWith({ stage: StageEnum.OFFENCE_BOOKED }, recommendation, 'token', flags)
    expect(updateRecall).toHaveBeenCalledWith({ stage: StageEnum.RELEASE_BOOKED }, recommendation, 'token', flags)

    expect(uploadMandatoryDocument).toHaveBeenCalledWith(
      { stage: StageEnum.RECALL_BOOKED },
      '1',
      StageEnum.RECALL_BOOKED,
      StageEnum.PART_A_UPLOADED,
      'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
      'PPUDPartA',
      'token',
      flags
    )
    expect(uploadMandatoryDocument).toHaveBeenCalledWith(
      { stage: StageEnum.PART_A_UPLOADED },
      '1',
      StageEnum.PART_A_UPLOADED,
      StageEnum.LICENCE_DOCUMENT_UPLOADED,
      'e0cc157d-5c31-4c2f-984f-4bc7b5491dff',
      'PPUDLicenceDocument',
      'token',
      flags
    )
    expect(uploadMandatoryDocument).toHaveBeenCalledWith(
      { stage: StageEnum.LICENCE_DOCUMENT_UPLOADED },
      '1',
      StageEnum.LICENCE_DOCUMENT_UPLOADED,
      StageEnum.PROBATION_EMAIL_UPLOADED,
      'e0cc157d-5c31-4c2f-984f-4bc7b5491daa',
      'PPUDProbationEmail',
      'token',
      flags
    )
    expect(uploadMandatoryDocument).toHaveBeenCalledWith(
      { stage: StageEnum.PROBATION_EMAIL_UPLOADED },
      '1',
      StageEnum.PROBATION_EMAIL_UPLOADED,
      StageEnum.OASYS_UPLOADED,
      'e0cc157d-5c31-4c2f-984f-4bc7b5491daa',
      'PPUDOASys',
      'token',
      flags
    )
    expect(uploadMandatoryDocument).toHaveBeenCalledWith(
      { stage: StageEnum.OASYS_UPLOADED },
      '1',
      StageEnum.OASYS_UPLOADED,
      StageEnum.PRECONS_UPLOADED,
      'e0cc157d-5c31-4c2f-984f-4bc7b5491dbb',
      'PPUDPrecons',
      'token',
      flags
    )
    expect(uploadMandatoryDocument).toHaveBeenCalledWith(
      { stage: StageEnum.PRECONS_UPLOADED },
      '1',
      StageEnum.PRECONS_UPLOADED,
      StageEnum.PSR_UPLOADED,
      'e0cc157d-5c31-4c2f-984f-4bc7b5491dcc',
      'PPUDPSR',
      'token',
      flags
    )
    expect(uploadMandatoryDocument).toHaveBeenCalledWith(
      { stage: StageEnum.PSR_UPLOADED },
      '1',
      StageEnum.PSR_UPLOADED,
      StageEnum.CHARGE_SHEET_UPLOADED,
      'e0cc157d-5c31-4c2f-984f-4bc7b5491ddd',
      'PPUDChargeSheet',
      'token',
      flags
    )

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['BOOKED_TO_PPUD', 'REC_CLOSED'],
      deActivate: [],
      recommendationId: '1',
      token: 'token',
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/booked-to-ppud`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post - exception', async () => {
    const recommendation = { id: '12345', crn: 'X123' }
    const flags = { xyz: true }

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath },
        flags,
        user: {
          username: 'Dave',
          token: 'token1',
          region: { code: 'N07', name: 'London' },
        },
      },
    })
    const next = mockNext()

    ;(bookOffender as jest.Mock).mockImplementation(() => {
      throw new PpudError(400, JSON.stringify({ something: 'text' }))
    })

    await bookToPpudController.post(req, res, next)

    expect(bookOffender).toHaveBeenCalledWith(
      {
        stage: StageEnum.STARTED,
        failed: true,
        failedMessage: '{"something":"text"}',
      },
      recommendation,
      'token',
      flags
    )
    expect(createOrUpdateSentence).not.toHaveBeenCalled()
    expect(updateOffence).not.toHaveBeenCalled()
    expect(updateRelease).not.toHaveBeenCalled()
    expect(updateRecall).not.toHaveBeenCalled()

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdBookingOnToPPUDError',
      'Dave',
      {
        crn: 'X123',
        recommendationId: '1',
        region: { code: 'N07', name: 'London' },
      },
      {
        xyz: true,
      }
    )

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
    expect(next).not.toHaveBeenCalled()
  })
})

class PpudError {
  public status: number

  public text: string

  constructor(status: number, text: string) {
    this.status = status
    this.text = text
  }
}
