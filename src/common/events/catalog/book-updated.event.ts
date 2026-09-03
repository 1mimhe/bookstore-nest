export class BookUpdatedEvent {
  constructor(
    public readonly bookId: string,
    public readonly titleId: string,
    public readonly userId: string,
    public readonly staffId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
