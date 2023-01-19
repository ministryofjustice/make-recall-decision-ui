import { dedupeList, groupListByValue, radioCheckboxItems, sortList } from './lists'

import { formOptions } from '../controllers/recommendations/formOptions/formOptions'

describe('List utilities', () => {
  describe('groupListByValue', () => {
    it('groups by value', () => {
      const list = [
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 5,
          b: 3,
          c: 9,
        },
        {
          a: 5,
          b: 2,
          c: 9,
        },
      ]
      const grouped = groupListByValue<{ a: number; b: number; c: number }>({ list, groupByKey: 'b' })
      expect(grouped).toEqual({
        groupedByKey: 'b',
        items: [
          {
            groupValue: 2,
            items: [
              {
                a: 1,
                b: 2,
                c: 3,
              },
              {
                a: 5,
                b: 2,
                c: 9,
              },
            ],
          },
          {
            groupValue: 3,
            items: [
              {
                a: 5,
                b: 3,
                c: 9,
              },
            ],
          },
        ],
      })
    })
  })

  describe('dedupeList', () => {
    it('removes duplicates', () => {
      const result = dedupeList(['aa', 'bb', 'aa', 'c', 'ddd'])
      expect(result).toEqual(['aa', 'bb', 'c', 'ddd'])
    })
  })

  describe('sortList', () => {
    it('sorts ascending', () => {
      const list = [{ name: 'bdd' }, { name: 'bbc' }, { name: 'bcc' }]
      const result = sortList(list, 'name', true)
      expect(result).toEqual([{ name: 'bbc' }, { name: 'bcc' }, { name: 'bdd' }])
    })

    it('sorting is case insensitive', () => {
      const list = [{ name: 'bdd' }, { name: 'BDE' }]
      const result = sortList<Record<string, string>>(list, 'name', true)
      expect(result).toEqual([{ name: 'bdd' }, { name: 'BDE' }])
    })

    it('sorts descending', () => {
      const list = [{ name: 'Licence.pdf' }, { name: 'Part A.pdf' }, { name: 'OASys.pdf' }]
      const result = sortList(list, 'name', false)
      expect(result).toEqual([{ name: 'Part A.pdf' }, { name: 'OASys.pdf' }, { name: 'Licence.pdf' }])
    })
  })

  describe('radioCheckboxItems function', () => {
    it('marks the selected items as checked', () => {
      const items = [
        {
          text: 'Standard recall',
          value: 'STANDARD',
        },
        {
          text: 'Fixed term recall',
          value: 'FIXED_TERM',
        },
        {
          text: 'No recall',
          value: 'NO_RECALL',
        },
      ]
      const result = radioCheckboxItems({ items, currentValues: 'FIXED_TERM' })
      expect(result).toEqual([
        {
          checked: false,
          text: 'Standard recall',
          value: 'STANDARD',
        },
        {
          checked: true,
          text: 'Fixed term recall',
          value: 'FIXED_TERM',
        },
        {
          checked: false,
          text: 'No recall',
          value: 'NO_RECALL',
        },
      ])
    })

    it('includes any provided conditional content', () => {
      const items = formOptions.recallType
      const result = radioCheckboxItems({
        items,
        currentValues: ['FIXED_TERM'],
        conditionalContent: {
          FIXED_TERM: '<div>test</div>',
        },
      })
      expect(result).toEqual([
        {
          checked: false,
          text: 'Standard recall',
          value: 'STANDARD',
        },
        {
          text: 'Fixed term recall',
          value: 'FIXED_TERM',
          checked: true,
          conditional: {
            html: '<div>test</div>',
          },
        },
        {
          checked: false,
          text: 'No recall',
          value: 'NO_RECALL',
        },
      ])
    })
  })
})
