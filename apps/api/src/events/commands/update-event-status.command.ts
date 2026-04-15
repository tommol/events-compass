export class UpdateEventStatusCommand {
  constructor(
    public readonly slug: string,
    public readonly status: "active" | "archived" | "deleted",
  ) {}
}
