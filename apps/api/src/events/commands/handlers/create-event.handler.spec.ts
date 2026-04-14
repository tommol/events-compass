import { EventsRepository } from "../../repository/events.repository";
import { CreateEventCommand } from "../create-event.command";
import { CreateEventCommandHandler } from "./create-event.handler";

describe("CreateEventCommandHandler", () => {
  it("builds a create payload with slug and author relation", async () => {
    const savedEvent = {
      id: "evt-1",
      name: "Frontend Meetup",
      slug: "frontend-meetup",
      description: "Warsaw edition",
    };
    const eventsRepository = {
      save: jest.fn().mockResolvedValue(savedEvent),
    };

    const handler = new CreateEventCommandHandler(
      eventsRepository as unknown as EventsRepository,
    );
    const result = await handler.execute(
      new CreateEventCommand(
        "Frontend Meetup",
        "owner@example.com",
        "Warsaw edition",
      ),
    );

    expect(eventsRepository.save).toHaveBeenCalledWith({
      name: "Frontend Meetup",
      slug: "frontend-meetup",
      author: {
        connectOrCreate: {
          where: { email: "owner@example.com" },
          create: { email: "owner@example.com" },
        },
      },
      description: "Warsaw edition",
    });
    expect(result).toBe(savedEvent);
  });
});
