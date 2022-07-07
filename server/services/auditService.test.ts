import { SQSClient } from '@aws-sdk/client-sqs'
import { AuditService } from './auditService'

describe('Audit service', () => {
  let auditService: AuditService

  beforeEach(() => {
    auditService = new AuditService()
    jest.spyOn(SQSClient.prototype, 'send').mockResolvedValue({} as never)
  })

  it('sends a prisoner search audit message', async () => {
    await auditService.personSearch({ searchTerm: 'sdsd', username: 'username' })
    const { MessageBody, QueueUrl } = (SQSClient.prototype.send as jest.Mock).mock.calls[0][0].input
    const { what, who, service, when, details } = JSON.parse(MessageBody)
    expect(QueueUrl).toEqual('foobar')
    expect(what).toEqual('SEARCHED_PERSONS')
    expect(who).toEqual('username')
    expect(service).toEqual('book-a-prison-visit-staff-ui')
    expect(when).toBeDefined()
    expect(details).toEqual('{"searchTerm":"sdsd"}')
  })
})
