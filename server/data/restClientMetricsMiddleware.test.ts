import { normalizePath } from './restClientMetricsMiddleware'

describe('restClientMetricsMiddleware', () => {
  describe('normalizePath', () => {
    it('removes the query params from the URL path', () => {
      const result = normalizePath('https://httpbin.org/?foo=bar')
      expect(result).toBe('/')
    })

    it('normalises recall ids', () => {
      const result = normalizePath(
        'https://manage-recalls-dev.hmpps.service.justice.gov.uk/recalls/15e4cccf-cc7b-4946-aa22-a82086735ec2/view-recall',
      )
      expect(result).toBe('/recalls/#val/view-recall')
    })

    it('normalises nomis ids', () => {
      const result = normalizePath('https://manage-recalls-dev.hmpps.service.justice.gov.uk/prisoner/A7826DY')
      expect(result).toBe('/prisoner/#val')
    })
  })
})
