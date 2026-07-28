import { RouteDefinition } from '../routes/standardRouter'
import { StringsDefinition } from './strings'

export type ModuleDefinition = {
  id: string
  path: string
  routes: RouteDefinition[]
  strings?: StringsDefinition
}
