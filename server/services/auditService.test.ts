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
    expect(SQSClient.prototype.send).toHaveBeenCalledTimes(1)
  })
})
