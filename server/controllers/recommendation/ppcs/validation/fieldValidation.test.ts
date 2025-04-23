import { Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { determineErrorId, reloadPageWithError } from './fieldValidation'
import { makeErrorObject } from '../../../../utils/errors'
import { NamedFormError } from '../../../../@types/pagesForms'
import { mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import { strings } from '../../../../textStrings/en'
import { randomErrorId } from '../../../../textStrings/en.testFactory'

jest.mock('../../../../utils/errors')

describe('determineErrorId', () => {
  it('defined value with empty validity restrictions results in no error', async () => {
    const errorId = determineErrorId('test', 'FieldName', [])

    expect(errorId).toBeUndefined()
  })
  it('defined value with null validity restrictions results in no error', async () => {
    const errorId = determineErrorId('test', 'FieldName', null)

    expect(errorId).toBeUndefined()
  })
  it('defined value with undefined validity restrictions results in no error', async () => {
    const errorId = determineErrorId('test', 'FieldName', undefined)

    expect(errorId).toBeUndefined()
  })
  it('defined valid value results in no error', async () => {
    const errorId = determineErrorId(1, 'FieldName', [3, 42, 1])

    expect(errorId).toBeUndefined()
  })
  it('undefined value results in missingX error', async () => {
    const errorId = determineErrorId(undefined, 'FieldName', [])

    expect(errorId).toEqual('missingFieldName')
  })
  it('null value results in missingX error', async () => {
    const errorId = determineErrorId(null, 'FieldName', [])

    expect(errorId).toEqual('missingFieldName')
  })
  it('defined invalid value results in invalidX error', async () => {
    const errorId = determineErrorId(1, 'FieldName', [3, 42, -1])

    expect(errorId).toEqual('invalidFieldName')
  })
})

describe('reloadPageWithError', () => {
  it('creates error and redirects', async () => {
    // given
    const errorId = randomErrorId()
    const fieldId = randomUUID()

    const error: NamedFormError = {
      name: randomUUID(),
      text: randomUUID(),
    }
    ;(makeErrorObject as jest.Mock).mockReturnValueOnce(error)
    const res: Response = mockRes()
    const req: Request = mockReq({ originalUrl: randomUUID() })

    // when
    reloadPageWithError(errorId, fieldId, req, res)

    // then
    expect(makeErrorObject).toHaveBeenCalledWith({
      id: fieldId,
      text: strings.errors[errorId],
      errorId,
    })
    expect(req.session.errors).toEqual([error])
    expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
  })
})
