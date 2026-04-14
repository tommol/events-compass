export class UpdateEventStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: "active" | "archived" | "deleted",
  ) {}
}
