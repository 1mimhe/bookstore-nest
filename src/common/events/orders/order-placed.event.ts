export class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly totalAmount: number,
    public readonly bookCount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
