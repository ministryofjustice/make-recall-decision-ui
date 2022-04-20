import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import { ObjectMap } from '../../@types'

export const mockReq = ({
  query = {},
  params = {},
  body = {},
  method = 'GET',
  headers = {},
  session = {} as SessionData,
  originalUrl,
  baseUrl,
  path = '/',
}: {
  body?: ObjectMap<string | boolean>
  query?: ObjectMap<string | boolean>
  params?: ObjectMap<string | boolean>
  headers?: ObjectMap<string | boolean>
  method?: string
  session?: SessionData
  originalUrl?: string
  baseUrl?: string
  path?: string
} = {}): Request => {
  return {
    query,
    params,
    body,
    headers,
    method,
    session,
    originalUrl,
    baseUrl,
    path,
  } as Request
}

export const mockRes = ({
  locals = {},
  token = 'token',
  redirect = jest.fn(),
  render = jest.fn(),
  sendStatus = jest.fn(),
}: {
  locals?: ObjectMap<unknown>
  token?: string
  redirect?: jest.Mock
  render?: jest.Mock
  sendStatus?: jest.Mock
} = {}): Response => {
  return {
    locals: {
      user: {
        ...((locals.user as object) || {}),
        token,
      },
      env: locals.env || 'PRODUCTION',
    },
    redirect,
    render,
    sendStatus,
  } as unknown as Response
}

export const mockNext = () => jest.fn()
