import { decorateContactTypes, parseSelectedFilters } from './contactTypes'
import { ContactHistoryFilters } from '../../../../@types/contactTypes'

describe('contactTypes helpers', () => {
  describe('parseSelectedFilters', () => {
    it('return undefined if given undefined contactTypes', () => {
      expect(parseSelectedFilters({ filters: { contactTypes: undefined } as ContactHistoryFilters })).toBeUndefined()
    })

    it('return undefined if given an empty string', () => {
      expect(parseSelectedFilters({ filters: { contactTypes: '' } as ContactHistoryFilters })).toBeUndefined()
    })

    it('returns an array if given a string', () => {
      const parsed = parseSelectedFilters({ filters: { contactTypes: 'IVSP' } as ContactHistoryFilters })
      expect(parsed).toEqual(['IVSP'])
    })

    it('returns an array if given an array of strings', () => {
      const parsed = parseSelectedFilters({ filters: { contactTypes: ['IVSP', 'EPOMAT'] } as ContactHistoryFilters })
      expect(parsed).toEqual(['IVSP', 'EPOMAT'])
    })
  })

  describe('decorateContactTypes', () => {
    it('flattens all groups into one list', () => {
      const contactTypeGroups = [
        {
          groupId: '1',
          label: 'Accredited programme',
          contactTypeCodes: ['IVSP'],
        },
        {
          groupId: '2',
          label: 'Appointments',
          contactTypeCodes: ['C191', 'C002'],
        },
      ]
      const allContacts = [
        { code: 'IVSP', descriptionType: 'Arrest attempt' },
        { code: 'C191', descriptionType: 'Management Oversight - Recall' },
        { code: 'C002', descriptionType: 'Planned Office Visit (NS)' },
      ]
      const result = decorateContactTypes({ contactTypeGroups, allContacts })
      expect(result).toEqual([
        {
          code: 'IVSP',
          count: 0,
          description: 'Arrest attempt',
        },
        {
          code: 'C191',
          count: 0,
          description: 'Management Oversight - Recall',
        },
        {
          code: 'C002',
          count: 0,
          description: 'Planned Office Visit (NS)',
        },
      ])
    })
  })
})
