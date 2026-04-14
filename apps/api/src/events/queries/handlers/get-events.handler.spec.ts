import { EventsRepository } from "../../repository/events.repository";
import { GetEventsQuery } from "../get-events.query";
import { GetEventsQueryHandler } from "./get-events.handler";

describe("GetEventsQueryHandler", () => {
  it("maps a list of entities into response DTOs", async () => {
    const startAt = new Date("2026-06-15T18:00:00.000Z");
    const endAt = new Date("2026-06-15T22:00:00.000Z");
    const eventsRepository = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: "evt-5",
          name: "API Summit",
          slug: "api-summit",
          description: "Backend-focused event",
          detail: {
            country: "Poland",
            city: "Krakow",
            region: "Malopolskie",
            postalCode: "30-001",
            address: "Rynek Glowny 1",
            venue: "ICE Krakow",
            startAt,
            endsAt: endAt,
          },
        },
      ]),
    };

    const handler = new GetEventsQueryHandler(
      eventsRepository as unknown as EventsRepository,
    );
    const result = await handler.execute(new GetEventsQuery(3, 10));

    expect(eventsRepository.findAll).toHaveBeenCalledWith(3, 10);
    expect(result).toEqual([
      {
        id: "evt-5",
        name: "API Summit",
        slug: "api-summit",
        description: "Backend-focused event",
        country: "Poland",
        city: "Krakow",
        region: "Malopolskie",
        postalCode: "30-001",
        address: "Rynek Glowny 1",
        venue: "ICE Krakow",
        startAt,
        endAt,
      },
    ]);
  });
});
