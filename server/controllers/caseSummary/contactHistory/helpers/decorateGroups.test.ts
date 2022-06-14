import { decorateGroups } from './decorateGroups'

describe('decorateGroups', () => {
  const allContactTypes = [
    {
      code: 'IVSP',
      description: 'Arrest attempt',
      count: 5,
    },
    {
      code: 'C191',
      description: 'Management Oversight - Recall',
      count: 15,
    },
    {
      code: 'C002',
      description: 'Planned Office Visit (NS)',
      count: 0,
    },
  ]
  const contactTypeGroups = [
    {
      groupId: '2',
      label: 'Appointments',
      contactTypeCodes: ['C191', 'C002'],
    },
    {
      groupId: '1',
      label: 'Accredited programme',
      contactTypeCodes: ['IVSP'],
    },
  ]
  const selectedContactTypes = ['C191', 'IVSP']

  it('excludes contact types with zero count', () => {
    const groups = decorateGroups({ allContactTypes, contactTypeGroups, selectedContactTypes })
    const appointmentsGroup = groups.find(group => group.label === 'Appointments')
    expect(appointmentsGroup.contactTypeCodes.find(type => type.value === 'C002')).toBeUndefined()
  })

  it('excludes contact types with zero count, when no types are selected', () => {
    const groups = decorateGroups({ allContactTypes, contactTypeGroups, selectedContactTypes: undefined })
    const appointmentsGroup = groups.find(group => group.label === 'Appointments')
    expect(appointmentsGroup.contactTypeCodes.find(type => type.value === 'C002')).toBeUndefined()
  })

  it('sorts groups by description', () => {
    const groups = decorateGroups({ allContactTypes, contactTypeGroups, selectedContactTypes })
    const groupDescriptions = groups.map(group => group.label)
    expect(groupDescriptions).toEqual(['Accredited programme', 'Appointments'])
  })

  it('excludes groups with zero total count, if none of their types are selected', () => {
    const groups = decorateGroups({
      allContactTypes: [
        {
          code: 'IVSP',
          description: 'Arrest attempt',
          count: 5,
        },
        {
          code: 'C191',
          description: 'Management Oversight - Recall',
          count: 0,
        },
        {
          code: 'C002',
          description: 'Planned Office Visit (NS)',
          count: 0,
        },
      ],
      contactTypeGroups,
      selectedContactTypes: ['IVSP'],
    })
    const appointmentsGroup = groups.find(group => group.label === 'Appointments')
    expect(appointmentsGroup).toBeUndefined()
  })

  it("includes a contact type with zero count, if it's already selected", () => {
    const groups = decorateGroups({
      allContactTypes: [
        {
          code: 'IVSP',
          description: 'Arrest attempt',
          count: 0,
        },
      ],
      contactTypeGroups: [
        {
          groupId: '1',
          label: 'Accredited programme',
          contactTypeCodes: ['IVSP'],
        },
      ],
      selectedContactTypes: ['IVSP'],
    })
    expect(groups[0].contactTypeCodes).toEqual([
      {
        count: 0,
        description: 'Arrest attempt',
        html: "Arrest attempt <span class='text-secondary'>(<span data-qa='contact-count'>0</span>)</span>",
        value: 'IVSP',
      },
    ])
  })

  it('includes groups with at least one type with a count, if the type is selected', () => {
    const groups = decorateGroups({
      allContactTypes: [
        {
          code: 'IVSP',
          description: 'Arrest attempt',
          count: 5,
        },
        {
          code: 'C191',
          description: 'Management Oversight - Recall',
          count: 3,
        },
        {
          code: 'C002',
          description: 'Planned Office Visit (NS)',
          count: 0,
        },
      ],
      contactTypeGroups,
      selectedContactTypes: ['IVSP', 'C191'],
    })
    const appointmentsGroup = groups.find(group => group.label === 'Appointments')
    expect(appointmentsGroup).toEqual({
      contactCountInGroup: 3,
      contactTypeCodes: [
        {
          count: 3,
          description: 'Management Oversight - Recall',
          html: "Management Oversight - Recall <span class='text-secondary'>(<span data-qa='contact-count'>3</span>)</span>",
          value: 'C191',
        },
      ],
      groupId: '2',
      isGroupOpen: true, // open the group because one of its types is selected
      label: 'Appointments',
    })
  })

  it('includes groups with at least one type with a count, if the type is not selected', () => {
    const groups = decorateGroups({
      allContactTypes: [
        {
          code: 'IVSP',
          description: 'Arrest attempt',
          count: 5,
        },
        {
          code: 'C191',
          description: 'Management Oversight - Recall',
          count: 3,
        },
        {
          code: 'C002',
          description: 'Planned Office Visit (NS)',
          count: 0,
        },
      ],
      contactTypeGroups,
      selectedContactTypes: ['IVSP'],
    })
    const appointmentsGroup = groups.find(group => group.label === 'Appointments')
    expect(appointmentsGroup).toEqual({
      contactCountInGroup: 3,
      contactTypeCodes: [
        {
          count: 3,
          description: 'Management Oversight - Recall',
          html: "Management Oversight - Recall <span class='text-secondary'>(<span data-qa='contact-count'>3</span>)</span>",
          value: 'C191',
        },
      ],
      groupId: '2',
      isGroupOpen: false, // close the group because none of its types are selected
      label: 'Appointments',
    })
  })
})
