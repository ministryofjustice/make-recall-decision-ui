import { selectedFilterItems } from './nunjucks'

describe('selectedFilterItems', () => {
  it('prefixes hrefs with the URL path', () => {
    const result = selectedFilterItems({
      items: [
        { href: '', text: 'Test' },
        { href: '?contactTypes=BFI', text: 'Test 2' },
      ],
      urlInfo: {
        path: '/licence-history',
      },
    })
    expect(result).toEqual([
      {
        href: '/licence-history',
        text: 'Test',
      },
      {
        href: '/licence-history?contactTypes=BFI',
        text: 'Test 2',
      },
    ])
  })
})
