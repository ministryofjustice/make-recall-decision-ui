import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import logger from '../../logger'
import config from '../config'

export class AuditService {
  private sqsClient: SQSClient

  constructor(
    private readonly accessKeyId = config.apis.audit.accessKeyId,
    private readonly secretAccessKey = config.apis.audit.secretAccessKey,
    private readonly region = config.apis.audit.region,
    private readonly queueUrl = config.apis.audit.queueUrl
  ) {
    this.sqsClient = new SQSClient({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
      endpoint: config.apis.audit.endpoint,
    })
  }

  async personSearch({ searchTerm, username }: { searchTerm: string; username: string }) {
    return this.sendAuditMessage({
      action: 'SEARCHED_PERSONS',
      who: username,
      details: {
        searchTerm,
      },
    })
  }

  async caseSummaryView({ sectionId, crn, username }: { sectionId: string; crn: string; username: string }) {
    return this.sendAuditMessage({
      action: 'VIEWED_CASE_SUMMARY',
      who: username,
      details: {
        crn,
        sectionId,
      },
    })
  }

  async sendAuditMessage({
    action,
    who,
    timestamp = new Date(),
    details,
  }: {
    action: string
    who: string
    timestamp?: Date
    details: object
  }) {
    try {
      const message = JSON.stringify({
        what: action,
        who,
        service: config.apis.audit.serviceName,
        when: timestamp,
        details: JSON.stringify(details),
      })

      const messageResponse = await this.sqsClient.send(
        new SendMessageCommand({
          MessageBody: message,
          QueueUrl: this.queueUrl,
        })
      )

      logger.info(`SQS message sent (${messageResponse.MessageId})`)
    } catch (error) {
      logger.error('Problem sending message to SQS queue', error)
    }
  }
}
