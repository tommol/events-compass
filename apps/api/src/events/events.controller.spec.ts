import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { CreateEventCommand } from "./commands/create-event.command";
import { UpdateEventDetailsCommand } from "./commands/update-event-details.command";
import { UpdateEventStatusCommand } from "./commands/update-event-status.command";
import { EventsController } from "./events.controller";
import { GetEventQuery } from "./queries/get-event.query";
import { GetEventsQuery } from "./queries/get-events.query";

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

    const result = await controller.getEvent("evt-2");

    expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetEventQuery));
    const query = queryBus.execute.mock.calls[0][0] as GetEventQuery;
    expect(query.id).toBe("evt-2");
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

    const result = await controller.updateEventDetails("evt-4", {
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
    expect(command.id).toBe("evt-4");
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

    const result = await controller.updateEventStatus("evt-5", {
      status: "archived",
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(UpdateEventStatusCommand),
    );
    const command = commandBus.execute.mock
      .calls[0][0] as UpdateEventStatusCommand;
    expect(command.id).toBe("evt-5");
    expect(command.status).toBe("archived");
    expect(result).toEqual({
      id: "evt-5",
      name: "API Summit",
      slug: "api-summit",
      description: "Archived event",
    });
  });
});
