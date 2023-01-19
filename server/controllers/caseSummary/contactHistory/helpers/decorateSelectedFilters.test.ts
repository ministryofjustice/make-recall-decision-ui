import { decorateSelectedFilters } from './decorateSelectedFilters'
import { ContactHistoryFilters } from '../../../../@types/contacts'

describe('decorateSelectedFilters', () => {
  it('returns filter data for a non-system generated contact', () => {
    const allContactTypes = [
      {
        code: 'CRSAPT',
        count: 8,
        description: 'Appointment with CRS Provider (NS)',
        systemGenerated: false,
      },
    ]
    const selectedContactTypes = ['CRSAPT']
    const filters = {
      includeSystemGenerated: 'YES',
      contactTypes: 'CRSAPT',
    } as ContactHistoryFilters
    const result = decorateSelectedFilters({ selectedContactTypes, allContactTypes, filters })
    expect(result).toEqual([
      {
        href: '?includeSystemGenerated=YES',
        text: 'Appointment with CRS Provider (NS)',
      },
    ])
  })

  it('returns filter data for a system generated contact', () => {
    const allContactTypes = [
      {
        code: 'CRSAPT',
        count: 8,
        description: 'Appointment with CRS Provider (NS)',
        systemGenerated: true,
      },
    ]
    const selectedContactTypes = ['CRSAPT']
    const filters = {
      includeSystemGenerated: 'YES',
      contactTypesSystemGenerated: 'CRSAPT',
    } as ContactHistoryFilters
    const result = decorateSelectedFilters({ selectedContactTypes, allContactTypes, filters })
    expect(result).toEqual([
      {
        href: '?includeSystemGenerated=YES',
        text: 'Appointment with CRS Provider (NS)',
      },
    ])
  })
})
