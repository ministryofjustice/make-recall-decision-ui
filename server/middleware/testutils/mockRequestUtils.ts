import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import { ParsedQs } from 'qs'
import { ParamsDictionary } from 'express-serve-static-core'

export const mockReq = ({
  query = {},
  params = {},
  body = {},
  file = undefined,
  cookies = {},
  method = 'GET',
  headers = {},
  session = {} as SessionData,
  originalUrl,
  baseUrl,
  path = '/',
}: {
  body?: Record<string, string | boolean | string[]>
  file?: Record<string, string | boolean | number | string[] | Buffer>
  query?: ParsedQs
  params?: ParamsDictionary
  headers?: Record<string, string | boolean>
  cookies?: Record<string, string>
  method?: string
  session?: SessionData
  originalUrl?: string
  baseUrl?: string
  path?: string
} = {}): Request => {
  return {
    query,
    file,
    params,
    body,
    headers,
    cookies,
    method,
    session,
    originalUrl,
    baseUrl,
    path,
  } as Request & { file: Record<string, string | boolean | string[]> }
}

export const mockRes = ({
  locals = {},
  token = 'token',
  redirect = jest.fn(),
  render = jest.fn(),
  sendStatus = jest.fn(),
  cookie = jest.fn(),
  contentType = jest.fn(),
  header = jest.fn(),
  send = jest.fn(),
  set = jest.fn(),
  writeHead = jest.fn(),
  end = jest.fn(),
}: {
  locals?: Record<string, unknown>
  token?: string
  redirect?: jest.Mock
  render?: jest.Mock
  sendStatus?: jest.Mock
  cookie?: jest.Mock
  contentType?: jest.Mock
  header?: jest.Mock
  send?: jest.Mock
  set?: jest.Mock
  writeHead?: jest.Mock
  end?: jest.Mock
} = {}): Response => {
  return {
    locals: {
      ...locals,
      user: {
        ...((locals.user as object) || {}),
        token,
      },
      env: locals.env || 'prod',
      flags: locals.flags || {},
      urlInfo: locals.urlInfo || {},
    },
    redirect,
    render,
    sendStatus,
    cookie,
    contentType,
    header,
    send,
    set,
    writeHead,
    end,
  } as unknown as Response
}

export const mockNext = () => jest.fn()
