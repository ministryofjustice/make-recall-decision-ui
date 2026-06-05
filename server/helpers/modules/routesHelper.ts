import { NextFunction, Request, Response } from 'express'
import { RouteDefinition } from '../../routes/standardRouter'

type RouteHandler = (req: Request, res: Response, next: NextFunction) => void
type HttpMethod = 'get' | 'post'
type ControllerDefinition = Partial<Record<HttpMethod, RouteHandler>>

const HTTP_METHODS: HttpMethod[] = ['get', 'post']

const generateRoutes = (path: string, controller: ControllerDefinition): RouteDefinition[] =>
  HTTP_METHODS.flatMap(method => {
    const handler = controller[method]
    return handler ? [{ path, method, handler }] : []
  })

export default {
  generateRoutes,
}
