export enum Errors {
  ASSETS_LIMIT = 'server.errors.assets.limit',
  CATEGORIES_LIMIT = 'server.errors.categories.limit',
  AUTH_ERROR = 'server.errors.auth.error',
  AUTH_INVALID_CREDENTIALS = 'server.errors.auth.invalid-credentials',
  AUTH_USER_NOT_VERIFIED = 'server.errors.auth.user-not-verified',
  AUTH_USER_ALREADY_REGISTERED = 'server.errors.auth.already-registered',
  AUTH_LOGIN_SENT_RECENTLY = 'server.errors.auth.login-sent-recently',
  RESET_PASSWORD_EMAIL_SENT_RECENTLY = 'server.errors.auth.reset_password_sent_recently',
  AUTH_USER_NOT_REGISTERED = 'server.errors.auth.user-not-registered',
  AUTH_USER_NOT_FOUND = 'server.errors.auth.user-not-found',
  AUTH_NO_PASSWORD_PROVIDED = 'server.errors.auth.no-password-provided',
  AUTH_CHANGE_PASSWORD_ERROR= 'server.errors.auth.change-password',
  AUTH_WRONG_CURRENT_PASSWORD = 'server.errors.auth.wrong-current-password',
  AUTH_WRONG_EMAIL_TOKEN = 'server.errors.auth.wrong-email-token',

  API_MOEX = 'server.errors.api.moex',
  API_YAHOO = 'server.errors.api.yahoo',
  API_CURRENCY = 'server.errors.api.currency',
  API_CRYPTO = 'server.errors.api.crypto',
  API_TINKOFF = 'server.errors.api.tinkoff'
}
