import { NotFoundException } from "@nestjs/common";

import { EventsRepository } from "../../repository/events.repository";
import { GetEventQuery } from "../get-event.query";
import { GetEventQueryHandler } from "./get-event.handler";

describe("GetEventQueryHandler", () => {
  it("maps an event entity into the response DTO", async () => {
    const startAt = new Date("2026-06-15T18:00:00.000Z");
    const endAt = new Date("2026-06-15T22:00:00.000Z");
    const eventsRepository = {
      findBySlug: jest.fn().mockResolvedValue({
        id: "evt-4",
        name: "Design Systems",
        slug: "design-systems",
        description: "Talks and panels",
        detail: {
          country: "Poland",
          city: "Warsaw",
          region: "Mazowieckie",
          postalCode: "00-001",
          address: "Marszalkowska 1",
          venue: "PGE Narodowy",
          startAt,
          endsAt: endAt,
        },
      }),
    };

    const handler = new GetEventQueryHandler(
      eventsRepository as unknown as EventsRepository,
    );
    const result = await handler.execute(new GetEventQuery("design-systems"));

    expect(eventsRepository.findBySlug).toHaveBeenCalledWith("design-systems");
    expect(result).toEqual({
      id: "evt-4",
      name: "Design Systems",
      slug: "design-systems",
      description: "Talks and panels",
      country: "Poland",
      city: "Warsaw",
      region: "Mazowieckie",
      postalCode: "00-001",
      address: "Marszalkowska 1",
      venue: "PGE Narodowy",
      startAt,
      endAt,
    });
  });

  it("throws NotFoundException when the event does not exist", async () => {
    const eventsRepository = {
      findBySlug: jest.fn().mockResolvedValue(null),
    };

    const handler = new GetEventQueryHandler(
      eventsRepository as unknown as EventsRepository,
    );

    await expect(
      handler.execute(new GetEventQuery("missing")),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
