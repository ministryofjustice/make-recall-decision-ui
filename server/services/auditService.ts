import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import logger from '../../logger'
import config from '../config'

export class AuditService {
  private sqsClient: SQSClient

  constructor(private readonly queueUrl = config.apis.audit.queueUrl) {
    this.sqsClient = new SQSClient({})
  }

  async personSearch({
    searchTerm,
    username,
    logErrors,
  }: {
    searchTerm: Record<string, string>
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

  async considerRecall({
    crn,
    recommendationId,
    username,
    action,
    logErrors,
  }: {
    crn: string
    recommendationId: string
    username: string
    action: 'CONSIDER_RECALL_CREATE' | 'CONSIDER_RECALL_EDIT'
    logErrors: boolean
  }) {
    return this.sendAuditMessage({
      action,
      who: username,
      details: {
        crn,
        recommendationId,
      },
      logErrors,
    })
  }

  async recommendationView({
    recommendationId,
    pageUrlSlug,
    crn,
    username,
    logErrors,
  }: {
    recommendationId?: string
    pageUrlSlug: string
    crn: string
    username: string
    logErrors: boolean
  }) {
    return this.sendAuditMessage({
      action: 'VIEWED_RECOMMENDATION_PAGE',
      who: username,
      details: {
        crn,
        recommendationId,
        pageUrlSlug,
      },
      logErrors,
    })
  }

  async recommendationDeleted({
    recommendationId,
    crn,
    username,
    logErrors,
  }: {
    recommendationId: string
    crn: string
    username: string
    logErrors: boolean
  }) {
    return this.sendAuditMessage({
      action: 'DELETED_RECOMMENDATION',
      who: username,
      details: {
        crn,
        recommendationId,
      },
      logErrors,
    })
  }

  async createPartA({
    recommendationId,
    crn,
    username,
    logErrors,
  }: {
    recommendationId: string
    crn: string
    username: string
    logErrors: boolean
  }) {
    return this.sendAuditMessage({
      action: 'CREATED_PART_A',
      who: username,
      details: {
        crn,
        recommendationId,
      },
      logErrors,
    })
  }

  async createNoRecallLetter({
    recommendationId,
    crn,
    username,
    logErrors,
  }: {
    recommendationId: string
    crn: string
    username: string
    logErrors: boolean
  }) {
    return this.sendAuditMessage({
      action: 'CREATED_NO_RECALL_LETTER',
      who: username,
      details: {
        crn,
        recommendationId,
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
