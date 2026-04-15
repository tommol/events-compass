export class EditTokenRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly eventId: string,
    public readonly token: string,
  ) {}
}
