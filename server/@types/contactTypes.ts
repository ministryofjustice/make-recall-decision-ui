import { ObjectMap } from './index'

export interface ContactTypeDecorated {
  code: string
  count: number
  description: string
}

export interface ContactTypeCode {
  value: string
  description: string
  html: string
  count: number
  attributes: ObjectMap<string>
}

export interface ContactTypeGroupDecorated {
  label: string
  isGroupOpen: boolean
  contactTypeCodes: ContactTypeCode[]
}

export interface ContactHistoryFilters {
  'dateFrom-day': string
  'dateFrom-month': string
  'dateFrom-year': string
  'dateTo-day': string
  'dateTo-month': string
  'dateTo-year': string
  contactTypes: string | string[]
  searchFilters: string | string[]
}

export interface SelectedFilterItem {
  text: string
  href: string
}
