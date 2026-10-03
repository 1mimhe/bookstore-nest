export class OrderReturnedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly bookCount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
