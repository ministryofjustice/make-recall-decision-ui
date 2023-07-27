import { SQSClient } from '@aws-sdk/client-sqs'
import { AuditService } from './auditService'
import logger from '../../logger'

describe('Audit service', () => {
  let auditService: AuditService

  beforeEach(() => {
    auditService = new AuditService()
  })

  it('sends a prisoner search audit message', async () => {
    jest.spyOn(SQSClient.prototype, 'send').mockResolvedValue({} as never)
    await auditService.personSearch({ searchTerm: { crn: 'sdsd' }, username: 'username', logErrors: true })
    const { MessageBody, QueueUrl } = (SQSClient.prototype.send as jest.Mock).mock.calls[0][0].input
    const { what, who, service, when, details } = JSON.parse(MessageBody)
    expect(QueueUrl).toEqual('foobar')
    expect(what).toEqual('SEARCHED_PERSONS')
    expect(who).toEqual('username')
    expect(service).toEqual('make-recall-decision-ui')
    expect(when).toBeDefined()
    expect(details).toEqual('{"searchTerm":{"crn":"sdsd"}}')
  })

  it('sends a case summary audit message', async () => {
    jest.spyOn(SQSClient.prototype, 'send').mockResolvedValue({} as never)
    const crn = '123'
    const sectionId = 'overview'
    await auditService.caseSummaryView({ crn, sectionId, username: 'username', logErrors: true })
    const { MessageBody, QueueUrl } = (SQSClient.prototype.send as jest.Mock).mock.calls[0][0].input
    const { what, who, service, when, details } = JSON.parse(MessageBody)
    expect(QueueUrl).toEqual('foobar')
    expect(what).toEqual('VIEWED_CASE_SUMMARY')
    expect(who).toEqual('username')
    expect(service).toEqual('make-recall-decision-ui')
    expect(when).toBeDefined()
    expect(details).toEqual(`{"crn":"${crn}","sectionId":"${sectionId}"}`)
  })

  it('sends a Make a recommendation audit message', async () => {
    jest.spyOn(SQSClient.prototype, 'send').mockResolvedValue({} as never)
    const crn = '123'
    const recommendationId = '456'
    const pageUrlSlug = 'confirmation'
    await auditService.recommendationView({ crn, recommendationId, pageUrlSlug, username: 'username', logErrors: true })
    const { MessageBody, QueueUrl } = (SQSClient.prototype.send as jest.Mock).mock.calls[0][0].input
    const { what, who, service, when, details } = JSON.parse(MessageBody)
    expect(QueueUrl).toEqual('foobar')
    expect(what).toEqual('VIEWED_RECOMMENDATION_PAGE')
    expect(who).toEqual('username')
    expect(service).toEqual('make-recall-decision-ui')
    expect(when).toBeDefined()
    expect(details).toEqual(`{"crn":"${crn}","recommendationId":"${recommendationId}","pageUrlSlug":"${pageUrlSlug}"}`)
  })

  it('logs out errors if logErrors is true', async () => {
    const err = new Error('SQS queue not found')
    jest.spyOn(SQSClient.prototype, 'send').mockRejectedValue(err as never)
    jest.spyOn(logger, 'error')
    await auditService.personSearch({ searchTerm: { crn: 'sdsd' }, username: 'username', logErrors: true })
    expect(logger.error).toHaveBeenCalledWith('Problem sending message to SQS queue', err)
  })

  it('does not log out errors if logErrors is false', async () => {
    jest.spyOn(SQSClient.prototype, 'send').mockRejectedValue(new Error('SQS queue not found') as never)
    jest.spyOn(logger, 'error')
    await auditService.personSearch({ searchTerm: { crn: 'sdsd' }, username: 'username', logErrors: false })
    expect(logger.error).not.toHaveBeenCalled()
  })
})
