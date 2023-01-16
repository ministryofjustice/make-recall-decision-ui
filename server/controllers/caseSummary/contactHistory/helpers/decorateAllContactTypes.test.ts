import { decorateAllContactTypes } from './decorateAllContactTypes'

describe('decorateAllContactTypes', () => {
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
    const result = decorateAllContactTypes({ contactTypeGroups, allContacts })
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
