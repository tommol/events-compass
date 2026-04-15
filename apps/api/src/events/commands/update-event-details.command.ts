export class UpdateEventDetailsCommand {
  constructor(
    public readonly id: string,
    public readonly token: string,
    public readonly description?: string,
    public readonly startAt?: Date,
    public readonly endAt?: Date,
    public readonly country?: string,
    public readonly city?: string,
    public readonly region?: string,
    public readonly postalCode?: string,
    public readonly address?: string,
    public readonly venue?: string,
  ) {}
}
