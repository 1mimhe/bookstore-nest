export class TitleCreatedEvent {
  constructor(
    public readonly titleId: string,
    public readonly titleName: string,
    public readonly userId: string,
    public readonly staffId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
