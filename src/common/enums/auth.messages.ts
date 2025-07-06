export enum AuthMessages {
  InvalidCredentials = 'Invalid credentials.',
  AlreadyAuthorized = 'User is already authorized. Logout first or refresh token.',
  MissingAccessToken = 'Access token is required but was not provided. Please include a valid access token in the request headers.',
  AccessDenied = 'Access Denied. You do not have the required permissions to perform this action.',
  InvalidToken = 'Invalid token. Please refresh it.'
}