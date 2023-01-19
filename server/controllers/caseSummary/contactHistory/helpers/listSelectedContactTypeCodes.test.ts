import { ContactHistoryFilters } from '../../../../@types/contacts'
import { listSelectedContactTypeCodes } from './listSelectedContactTypeCodes'

describe('listSelectedContactTypeCodes', () => {
  it('return undefined if given undefined contactTypes', () => {
    expect(
      listSelectedContactTypeCodes({ filters: { contactTypes: undefined } as ContactHistoryFilters })
    ).toBeUndefined()
  })

  it('return undefined if given an empty string', () => {
    expect(listSelectedContactTypeCodes({ filters: { contactTypes: '' } as ContactHistoryFilters })).toBeUndefined()
  })

  it('returns an array if given a string', () => {
    const parsed = listSelectedContactTypeCodes({ filters: { contactTypes: 'IVSP' } as ContactHistoryFilters })
    expect(parsed).toEqual(['IVSP'])
  })

  it('returns an array if given an array of strings', () => {
    const parsed = listSelectedContactTypeCodes({
      filters: { contactTypes: ['IVSP', 'EPOMAT'] } as ContactHistoryFilters,
    })
    expect(parsed).toEqual(['IVSP', 'EPOMAT'])
  })

  it('joins contactTypes and contactTypesSystemGenerated if "include system generated" filter is set', () => {
    const parsed = listSelectedContactTypeCodes({
      filters: {
        contactTypes: ['IVSP', 'EPOMAT'],
        contactTypesSystemGenerated: ['ABC'],
        includeSystemGenerated: 'YES',
      } as ContactHistoryFilters,
    })
    expect(parsed).toEqual(['IVSP', 'EPOMAT', 'ABC'])
  })

  it('does not join contactTypes and contactTypesSystemGenerated if "include system generated" filter is not set', () => {
    const parsed = listSelectedContactTypeCodes({
      filters: {
        contactTypes: ['IVSP', 'EPOMAT'],
        contactTypesSystemGenerated: ['ABC'],
        includeSystemGenerated: '',
      } as ContactHistoryFilters,
    })
    expect(parsed).toEqual(['IVSP', 'EPOMAT'])
  })
})
