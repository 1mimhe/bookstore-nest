export enum EventNames {
  // Catalog / Title Events
  TitleCreated = 'title.created',
  TitleUpdated = 'title.updated',
  BookCreated = 'book.created',
  BookUpdated = 'book.updated',
  CharacterCreated = 'character.created',
  CharacterUpdated = 'character.updated',

  // Order Events
  OrderPlaced = 'order.placed',
  OrderCancelled = 'order.cancelled',
  OrderCompleted = 'order.completed',
  OrderReturned = 'order.returned',

  // Payment Events (pushed via PSP webhook)
  PaymentSucceeded = 'payment.succeeded',
  PaymentFailed = 'payment.failed',

  // Health Events (log-only alert hooks)
  HealthDegraded = 'health.degraded',

  // User / Auth Events
  UserRegistered = 'user.registered',
  UserLoggedIn = 'user.logged_in',
}

export const DomainEvents = EventNames;
