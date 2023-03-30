import sanitizeInputValues from './sanitizeInputValues'
import { mockNext, mockReq, mockRes } from '../middleware/testutils/mockRequestUtils'

describe('sanitize input values', () => {
  it('sanitize body', async () => {
    const body = {
      someStructure: {
        one: '<b>this is in bold</b>',
      },
      someArray: ['<span>some text</span>'],
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sanitizeInputValues(mockReq({ body }), mockRes(), mockNext)

    expect(body.someStructure.one).toEqual('this is in bold')
    expect(body.someArray[0]).toEqual('some text')
  })
  it('sanitize query', async () => {
    const query = {
      arg: '<b>this is in bold</b>',
    }

    sanitizeInputValues(mockReq({ query }), mockRes(), mockNext)

    expect(query.arg).toEqual('this is in bold')
  })
  it('sanitize params', async () => {
    const params = {
      arg: '<b>this is in bold</b>',
    }

    sanitizeInputValues(mockReq({ params }), mockRes(), mockNext)

    expect(params.arg).toEqual('this is in bold')
  })
})
