export class UpdateEventRequestCommand {
  constructor(
    public readonly email: string,
    public readonly eventSlug: string
  ){}
}
