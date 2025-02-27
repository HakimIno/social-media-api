import type { JwtPayload } from '@tsndr/cloudflare-worker-jwt'
import type { Toucan } from 'toucan-js'

type Environment = {
  Bindings: {
    ENV: string
    JWT_SECRET: string
    JWT_ACCESS_EXPIRATION_MINUTES: number
    JWT_REFRESH_EXPIRATION_DAYS: number
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: number
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: number
    DATABASE_NAME: string
    DATABASE_USERNAME: string
    DATABASE_PASSWORD: string
    DATABASE_HOST: string
    SENTRY_DSN: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_REGION: string
    EMAIL_SENDER: string
    OAUTH_GOOGLE_CLIENT_ID: string
    OAUTH_GOOGLE_CLIENT_SECRET: string
    OAUTH_GOOGLE_REDIRECT_URL: string

  }
  Variables: {
    payload: JwtPayload
    sentry: Toucan
  }
}

