import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import supportingDocumentsController from './supportingDocumentsController'
import { getSupportingDocuments } from '../../data/makeDecisionApiClient'
import {
  SupportingDocument,
  SupportingDocumentType,
} from '../../@types/make-recall-decision-api/models/SupportingDocumentsResponse'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const supportingDocuments = {
      PPUDPartA: {
        title: 'Part A',
        type: SupportingDocumentType.PPUDPartA,
        filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
        id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
      },
      PPUDLicenceDocument: { title: 'Licence', type: SupportingDocumentType.PPUDLicenceDocument },
      PPUDProbationEmail: { title: 'Email from probation', type: SupportingDocumentType.PPUDProbationEmail },
      PPUDOASys: { title: 'OASys', type: SupportingDocumentType.PPUDOASys },
      PPUDPrecons: { title: 'Previous convictions (MG16)', type: SupportingDocumentType.PPUDPrecons },
      PPUDPSR: { title: 'Pre-sentence report', type: SupportingDocumentType.PPUDPSR },
      PPUDChargeSheet: { title: 'Police charge sheet (MG4)', type: SupportingDocumentType.PPUDChargeSheet },
      PPUDOthers: [] as SupportingDocument[],
    }

    ;(getSupportingDocuments as jest.Mock).mockReturnValueOnce(supportingDocuments)

    const res = mockRes()
    const next = mockNext()
    await supportingDocumentsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'supportingDocuments' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/supportingDocuments')
    expect(res.locals.documents).toEqual([
      supportingDocuments.PPUDPartA,
      supportingDocuments.PPUDLicenceDocument,
      supportingDocuments.PPUDProbationEmail,
      supportingDocuments.PPUDOASys,
      supportingDocuments.PPUDPrecons,
      supportingDocuments.PPUDPSR,
      supportingDocuments.PPUDChargeSheet,
    ])
    expect(next).toHaveBeenCalled()
  })
})
