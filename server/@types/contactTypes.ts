import { ObjectMap } from './index'

export interface ContactTypeDecorated {
  code: string
  count: number
  description: string
  systemGenerated: boolean
}

export interface ContactTypeCode {
  value: string
  description: string
  html: string
  count: number
  systemGenerated: boolean
  attributes: ObjectMap<string>
}

export interface ContactTypeGroupDecorated {
  label: string
  isGroupOpen: boolean
  contactTypeCodes: ContactTypeCode[]
  contactTypeCodesSystemGenerated?: ContactTypeCode[]
}

export interface ContactHistoryFilters {
  'dateFrom-day': string
  'dateFrom-month': string
  'dateFrom-year': string
  'dateTo-day': string
  'dateTo-month': string
  'dateTo-year': string
  contactTypes: string | string[]
  contactTypesSystemGenerated?: string | string[]
  searchFilters: string | string[]
  includeSystemGenerated: string
}

export interface SelectedFilterItem {
  text: string
  href: string
}