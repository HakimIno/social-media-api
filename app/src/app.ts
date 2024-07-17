import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { ApiError, customLogger } from './utils'

import { Environment } from '../../bindings'
import { sentry } from '@hono/sentry'
import httpStatus from 'http-status'
import { errorHandler } from './middlewares'
import { defaultRoutes } from './routes'

const app = new Hono<Environment>()

app.use('*', sentry())
app.use('*', cors())
app.use('*', logger(customLogger))
app.notFound(() => {
	throw new ApiError(httpStatus.NOT_FOUND, 'Not found')
})

app.onError(errorHandler)

defaultRoutes.forEach((route) => {
	app.route(`${route.path}`, route.route)
})

export default {
	port: 8888,
	fetch: app.fetch
}
