import { NotFoundException } from "@nestjs/common";

import { EventsRepository } from "../../repository/events.repository";
import { UpdateEventStatusCommand } from "../update-event-status.command";
import { UpdateEventStatusCommandHandler } from "./update-event-status.handler";

describe("UpdateEventStatusCommandHandler", () => {
  it("updates the status when the event exists", async () => {
    const updatedEvent = { id: "evt-3", status: "archived" };
    const eventsRepository = {
      exists: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue(updatedEvent),
    };

    const handler = new UpdateEventStatusCommandHandler(
      eventsRepository as unknown as EventsRepository,
    );
    const result = await handler.execute(
      new UpdateEventStatusCommand("evt-3", "archived"),
    );

    expect(eventsRepository.exists).toHaveBeenCalledWith("evt-3");
    expect(eventsRepository.update).toHaveBeenCalledWith(
      "evt-3",
      { status: "archived" },
      {},
    );
    expect(result).toBe(updatedEvent);
  });

  it("throws NotFoundException when the event does not exist", async () => {
    const eventsRepository = {
      exists: jest.fn().mockResolvedValue(false),
      update: jest.fn(),
    };

    const handler = new UpdateEventStatusCommandHandler(
      eventsRepository as unknown as EventsRepository,
    );

    await expect(
      handler.execute(new UpdateEventStatusCommand("missing", "deleted")),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(eventsRepository.update).not.toHaveBeenCalled();
  });
});
