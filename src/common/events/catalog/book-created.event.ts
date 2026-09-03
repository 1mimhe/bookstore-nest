export class BookCreatedEvent {
  constructor(
    public readonly bookId: string,
    public readonly titleId: string,
    public readonly isbn: string,
    public readonly userId: string,
    public readonly staffId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
