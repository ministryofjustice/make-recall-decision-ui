import { selectedFilterItems } from './nunjucks'

describe('selectedFilterItems', () => {
  it('prefixes hrefs with the URL path', () => {
    const result = selectedFilterItems({
      items: [
        { href: '', text: 'Test' },
        { href: '?contactTypes=BFI', text: 'Test 2' },
      ],
      urlInfo: {
        path: '/contact-history',
      },
    })
    expect(result).toEqual([
      {
        href: '/contact-history',
        text: 'Test',
      },
      {
        href: '/contact-history?contactTypes=BFI',
        text: 'Test 2',
      },
    ])
  })
})
