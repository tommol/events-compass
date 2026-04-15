import { NotFoundException } from "@nestjs/common";

import { EventsRepository } from "../../repository/events.repository";
import { UpdateEventStatusCommand } from "../update-event-status.command";
import { UpdateEventStatusCommandHandler } from "./update-event-status.handler";

describe("UpdateEventStatusCommandHandler", () => {
  it("updates the status when the event exists", async () => {
    const updatedEvent = { id: "evt-3", status: "archived" };
    const eventsRepository = {
      existsBySlug: jest.fn().mockResolvedValue(true),
      updateBySlug: jest.fn().mockResolvedValue(updatedEvent),
    };

    const handler = new UpdateEventStatusCommandHandler(
      eventsRepository as unknown as EventsRepository,
    );
    const result = await handler.execute(
      new UpdateEventStatusCommand("api-summit", "archived"),
    );

    expect(eventsRepository.existsBySlug).toHaveBeenCalledWith("api-summit");
    expect(eventsRepository.updateBySlug).toHaveBeenCalledWith(
      "api-summit",
      { status: "archived" },
      {},
    );
    expect(result).toBe(updatedEvent);
  });

  it("throws NotFoundException when the event does not exist", async () => {
    const eventsRepository = {
      existsBySlug: jest.fn().mockResolvedValue(false),
      updateBySlug: jest.fn(),
    };

    const handler = new UpdateEventStatusCommandHandler(
      eventsRepository as unknown as EventsRepository,
    );

    await expect(
      handler.execute(new UpdateEventStatusCommand("missing", "deleted")),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(eventsRepository.updateBySlug).not.toHaveBeenCalled();
  });
});
