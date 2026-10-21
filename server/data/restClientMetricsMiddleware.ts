import promClient from 'prom-client'
import UrlValueParser from 'url-value-parser'

const requestHistogram = new promClient.Histogram({
  name: 'http_client_requests_seconds',
  help: 'Timings and counts of http client requests',
  buckets: [0.5, 0.75, 0.95, 0.99, 1],
  labelNames: ['clientName', 'method', 'uri', 'status'],
})

const timeoutCounter = new promClient.Counter({
  name: 'http_client_requests_timeout_total',
  help: 'Count of http client request timeouts',
  labelNames: ['clientName', 'method', 'uri'],
})

function normalizePath(url: string) {
  const { pathname } = new URL(url)
  const urlPathReplacement = '#val'
  const urlValueParser = new UrlValueParser({ extraMasks: [/^[A-Z|0-9]+/] })
  return urlValueParser.replacePathValues(pathname, urlPathReplacement)
}

export { normalizePath, requestHistogram, timeoutCounter }
