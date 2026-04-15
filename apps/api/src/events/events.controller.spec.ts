import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { CreateEventCommand } from "./commands/create-event.command";
import { UpdateEventDetailsCommand } from "./commands/update-event-details.command";
import { ReclassifyEventCommand } from "./commands/reclassify-event.command";
import { ReclassifyUnclassifiedEventsCommand } from "./commands/reclassify-unclassified-events.command";
import { UpdateEventStatusCommand } from "./commands/update-event-status.command";
import { EventsController } from "./events.controller";
import { GetEventQuery } from "./queries/get-event.query";
import { GetEventsQuery } from "./queries/get-events.query";
import { SearchEventsQuery } from "./queries/search-events.query";

describe("EventsController", () => {
  let controller: EventsController;
  let commandBus: { execute: jest.Mock };
  let queryBus: { execute: jest.Mock };

  beforeEach(() => {
    commandBus = { execute: jest.fn() };
    queryBus = { execute: jest.fn() };
    controller = new EventsController(
      commandBus as unknown as CommandBus,
      queryBus as unknown as QueryBus,
    );
  });

  it("creates an event through the command bus and maps the response", async () => {
    commandBus.execute.mockResolvedValue({
      id: "evt-1",
      name: "Frontend Meetup",
      slug: "frontend-meetup",
      description: "Warsaw edition",
    });

    const result = await controller.createEvent({
      name: "Frontend Meetup",
      email: "owner@example.com",
      description: "Warsaw edition",
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateEventCommand),
    );
    const command = commandBus.execute.mock.calls[0][0] as CreateEventCommand;
    expect(command.title).toBe("Frontend Meetup");
    expect(command.authorEmail).toBe("owner@example.com");
    expect(command.description).toBe("Warsaw edition");
    expect(result).toEqual({
      id: "evt-1",
      name: "Frontend Meetup",
      slug: "frontend-meetup",
      description: "Warsaw edition",
    });
  });

  it("fetches a single event through the query bus", async () => {
    const event = { id: "evt-2", name: "JS Conf", slug: "js-conf" };
    queryBus.execute.mockResolvedValue(event);

    const result = await controller.getEvent("js-conf");

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetEventQuery));
    const query = queryBus.execute.mock.calls[0][0] as GetEventQuery;
    expect(query.slug).toBe("js-conf");
    expect(result).toBe(event);
  });

  it("fetches paginated events through the query bus", async () => {
    const events = [{ id: "evt-3", name: "NestJS Day", slug: "nestjs-day" }];
    queryBus.execute.mockResolvedValue(events);

    const result = await controller.getEvents(2, 5);

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetEventsQuery));
    const query = queryBus.execute.mock.calls[0][0] as GetEventsQuery;
    expect(query.page).toBe(2);
    expect(query.limit).toBe(5);
    expect(result).toBe(events);
  });

  it("searches events through the query bus", async () => {
    const events = [{ id: "evt-6", name: "Frontend Warsaw", slug: "frontend-warsaw" }];
    queryBus.execute.mockResolvedValue(events);

    const result = await controller.searchEvents({ q: "warsaw", page: 2, limit: 5 });

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(SearchEventsQuery));
    const query = queryBus.execute.mock.calls[0][0] as SearchEventsQuery;
    expect(query.term).toBe("warsaw");
    expect(query.page).toBe(2);
    expect(query.limit).toBe(5);
    expect(result).toBe(events);
  });

  it("updates event details and maps nested detail fields", async () => {
    const startAt = new Date("2026-06-15T18:00:00.000Z");
    const endAt = new Date("2026-06-15T22:00:00.000Z");

    commandBus.execute.mockResolvedValue({
      id: "evt-4",
      name: "Design Systems",
      slug: "design-systems",
      description: "Updated description",
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
    });

    const result = await controller.updateEventDetails("design-systems", {
      token: "tok-123",
      description: "Updated description",
      startAt,
      endAt,
      country: "Poland",
      city: "Warsaw",
      region: "Mazowieckie",
      postalCode: "00-001",
      address: "Marszalkowska 1",
      venue: "PGE Narodowy",
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(UpdateEventDetailsCommand),
    );
    const command = commandBus.execute.mock
      .calls[0][0] as UpdateEventDetailsCommand;
    expect(command.slug).toBe("design-systems");
    expect(command.token).toBe("tok-123");
    expect(command.endAt).toBe(endAt);
    expect(result).toEqual({
      id: "evt-4",
      name: "Design Systems",
      slug: "design-systems",
      description: "Updated description",
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

  it("updates event status through the command bus", async () => {
    commandBus.execute.mockResolvedValue({
      id: "evt-5",
      name: "API Summit",
      slug: "api-summit",
      description: "Archived event",
    });

    const result = await controller.updateEventStatus("api-summit", {
      status: "archived",
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(UpdateEventStatusCommand),
    );
    const command = commandBus.execute.mock
      .calls[0][0] as UpdateEventStatusCommand;
    expect(command.slug).toBe("api-summit");
    expect(command.status).toBe("archived");
    expect(result).toEqual({
      id: "evt-5",
      name: "API Summit",
      slug: "api-summit",
      description: "Archived event",
    });
  });

  it("triggers event reclassification through the command bus", async () => {
    commandBus.execute.mockResolvedValue(undefined);

    await expect(controller.reclassifyEvent("ai-meetup")).resolves.toBeUndefined();

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(ReclassifyEventCommand),
    );
    const command = commandBus.execute.mock.calls[0][0] as ReclassifyEventCommand;
    expect(command.slug).toBe("ai-meetup");
  });

  it("triggers batch reclassification for unclassified events", async () => {
    commandBus.execute.mockResolvedValue(3);

    const result = await controller.reclassifyUnclassifiedEvents();

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(ReclassifyUnclassifiedEventsCommand),
    );
    expect(result).toEqual({ queued: 3 });
  });
});
