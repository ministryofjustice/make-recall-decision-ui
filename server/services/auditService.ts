import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import logger from '../../logger'
import config from '../config'
import { isPreprodOrProd } from '../utils/utils'

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

  async personSearch({
    searchTerm,
    username,
    logErrors,
  }: {
    searchTerm: string
    username: string
    logErrors: boolean
  }) {
    return this.sendAuditMessage({
      action: 'SEARCHED_PERSONS',
      who: username,
      details: {
        searchTerm,
      },
      logErrors,
    })
  }

  async caseSummaryView({
    sectionId,
    crn,
    username,
    logErrors,
  }: {
    sectionId: string
    crn: string
    username: string
    logErrors: boolean
  }) {
    return this.sendAuditMessage({
      action: 'VIEWED_CASE_SUMMARY',
      who: username,
      details: {
        crn,
        sectionId,
      },
      logErrors,
    })
  }

  async sendAuditMessage({
    action,
    who,
    timestamp = new Date(),
    details,
    logErrors,
  }: {
    action: string
    who: string
    timestamp?: Date
    details: object
    logErrors: boolean
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
      if (logErrors) {
        logger.error('Problem sending message to SQS queue', error)
      }
    }
  }
}
