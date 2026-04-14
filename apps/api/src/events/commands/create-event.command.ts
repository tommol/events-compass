export class CreateEventCommand {
  constructor(
    public readonly title: string,
    public readonly authorEmail: string,
    public readonly description?: string,
  ) {}
}
