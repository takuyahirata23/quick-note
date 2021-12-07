import dotenv from 'dotenv'
import { createCookieSessionStorage, redirect } from 'remix'
import { isString } from '~/utils/functions'

dotenv.config()

const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret) throw new Error('Session Secret is missing')

const storage = createCookieSessionStorage({
  cookie: {
    name: 'QN_session',
    secrets: [sessionSecret],
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true
  }
})

export const startUserSession = async (userId: string) => {
  const session = await storage.getSession()

  session.set('userId', userId)

  return redirect('/dashboard', {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}

export const getUserSession = (request: Request) =>
  storage.getSession(request.headers.get('Cookie'))

export const getUserId = async (request: Request) => {
  const session = await getUserSession(request)
  const userId = session.get('userId')

  return isString(userId) ? userId : null
}

export const requiredUserId = async (request: Request) => {
  const session = await getUserSession(request)
  const userId = session.get('userId')

  if (!isString(userId)) {
    throw redirect('/login')
  }

  return userId
}

export const endUserSession = async (request: Request) => {
  const session = await getUserSession(request)

  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session)
    }
  })
}