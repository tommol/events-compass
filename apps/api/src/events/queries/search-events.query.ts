export class SearchEventsQuery {
  constructor(
    public readonly term: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}