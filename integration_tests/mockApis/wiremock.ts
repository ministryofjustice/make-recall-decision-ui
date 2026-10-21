// port 9091 is aligned with what is defined in the HMPPS node_integration_tests.yml workflow
const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): Promise<Response> =>
  fetch(`${url}/mappings`, {
    method: 'POST',
    body: JSON.stringify(mapping),
    headers: { 'Content-Type': 'application/json' },
  })

const getRequests = (): Promise<Response> => fetch(`${url}/requests`)

const resetStubs = (): Promise<[Response, Response]> =>
  Promise.all([fetch(`${url}/mappings`, { method: 'DELETE' }), fetch(`${url}/requests`, { method: 'DELETE' })])

export { stubFor, getRequests, resetStubs }
