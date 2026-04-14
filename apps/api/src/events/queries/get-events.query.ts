export class GetEventsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
