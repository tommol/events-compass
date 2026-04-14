import { NotFoundException } from "@nestjs/common";

import { EventsRepository } from "../../repository/events.repository";
import { UpdateEventDetailsCommand } from "../update-event-details.command";
import { UpdateEventDetailsCommandHandler } from "./update-event-details.handler";

describe("UpdateEventDetailsCommandHandler", () => {
  it("updates event data and detail data when the event exists", async () => {
    const startAt = new Date("2026-06-15T18:00:00.000Z");
    const endAt = new Date("2026-06-15T22:00:00.000Z");
    const updatedEvent = { id: "evt-2", detail: { endsAt: endAt } };
    const eventsRepository = {
      exists: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue(updatedEvent),
    };

    const handler = new UpdateEventDetailsCommandHandler(
      eventsRepository as unknown as EventsRepository,
    );
    const result = await handler.execute(
      new UpdateEventDetailsCommand(
        "evt-2",
        "Updated description",
        startAt,
        endAt,
        "Poland",
        "Warsaw",
        "Mazowieckie",
        "00-001",
        "Marszalkowska 1",
        "PGE Narodowy",
      ),
    );

    expect(eventsRepository.exists).toHaveBeenCalledWith("evt-2");
    expect(eventsRepository.update).toHaveBeenCalledWith(
      "evt-2",
      { description: "Updated description" },
      {
        startAt,
        endsAt: endAt,
        country: "Poland",
        city: "Warsaw",
        region: "Mazowieckie",
        postalCode: "00-001",
        address: "Marszalkowska 1",
        venue: "PGE Narodowy",
      },
    );
    expect(result).toBe(updatedEvent);
  });

  it("throws NotFoundException when the event does not exist", async () => {
    const eventsRepository = {
      exists: jest.fn().mockResolvedValue(false),
      update: jest.fn(),
    };

    const handler = new UpdateEventDetailsCommandHandler(
      eventsRepository as unknown as EventsRepository,
    );

    await expect(
      handler.execute(new UpdateEventDetailsCommand("missing")),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(eventsRepository.update).not.toHaveBeenCalled();
  });
});
