import 'dotenv/config'

const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  https: production,
  applicationName: 'Consider a recall',
  staticResourceCacheDuration: 20,
  redis: {
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    makeRecallDecisionApi: {
      url: get('MAKE_RECALL_DECISION_API_URL', 'http://localhost:9091', requiredInProduction),
      timeout: {
        response: Number(get('MAKE_RECALL_DECISION_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('MAKE_RECALL_DECISION_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('MAKE_RECALL_DECISION_API_TIMEOUT_RESPONSE', 20000))),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    audit: {
      region: get('AUDIT_SQS_REGION', 'eu-west-2', requiredInProduction),
      queueUrl: get('AUDIT_SQS_QUEUE_URL', 'foobar', requiredInProduction),
      serviceName: get('AUDIT_SERVICE_NAME', 'make-recall-decision-ui', requiredInProduction),
    },
    makeRecallDecisionsDeliusFacade: {
      url: get('MAKE_RECALL_DECISIONS_AND_DELIUS_API_URL', 'http://localhost:8081/delius', requiredInProduction),
      timeout: {
        response: Number(get('MAKE_RECALL_DECISIONS_AND_DELIUS_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('MAKE_RECALL_DECISIONS_AND_DELIUS_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('MAKE_RECALL_DECISIONS_AND_DELIUS_API_TIMEOUT_RESPONSE', 5000))),
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  displayMaintenancePage: get('DISPLAY_MAINTENANCE_PAGE', false, requiredInProduction),
  maintenancePageText: get('MAINTENANCE_PAGE_TEXT', null),
  notification: {
    active: get('SHOW_NOTIFICATION', false, requiredInProduction),
    header: get('NOTIFICATION_HEADER', null, { requireInProduction: true }),
    body: get('NOTIFICATION_BODY', null, { requireInProduction: true }),
  },
}
