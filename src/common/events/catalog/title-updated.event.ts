export class TitleUpdatedEvent {
  constructor(
    public readonly titleId: string,
    public readonly updatedFields: string[],
    public readonly userId: string,
    public readonly staffId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
