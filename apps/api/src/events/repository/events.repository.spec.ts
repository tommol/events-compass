import { PrismaService } from "../../prisma/prisma.service";

import { EventsRepository } from "./events.repository";

describe("EventsRepository", () => {
  let prisma: {
    event: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    eventDetail: {
      upsert: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let repository: EventsRepository;

  beforeEach(() => {
    prisma = {
      event: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      eventDetail: {
        upsert: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    repository = new EventsRepository(prisma as unknown as PrismaService);
  });

  it("saves a new event through Prisma", async () => {
    const input = { name: "Frontend Meetup", slug: "frontend-meetup" };
    const savedEvent = { id: "evt-1", ...input };
    prisma.event.create.mockResolvedValue(savedEvent);

    await expect(repository.save(input as never)).resolves.toBe(savedEvent);
    expect(prisma.event.create).toHaveBeenCalledWith({
      data: input,
    });
  });

  it("finds an active event by default", async () => {
    prisma.event.findUnique.mockResolvedValue({ id: "evt-2" });

    await repository.findById("evt-2");

    expect(prisma.event.findUnique).toHaveBeenCalledWith({
      where: {
        id: "evt-2",
        status: "active",
      },
      include: {
        detail: true,
      },
    });
  });

  it("can find an event regardless of status when requested", async () => {
    prisma.event.findUnique.mockResolvedValue({ id: "evt-3" });

    await repository.findById("evt-3", false);

    expect(prisma.event.findUnique).toHaveBeenCalledWith({
      where: {
        id: "evt-3",
        status: undefined,
      },
      include: {
        detail: true,
      },
    });
  });

  it("returns true when an event exists", async () => {
    prisma.event.findUnique.mockResolvedValue({ id: "evt-4" });

    await expect(repository.exists("evt-4")).resolves.toBe(true);
    expect(prisma.event.findUnique).toHaveBeenCalledWith({
      where: { id: "evt-4" },
      include: { detail: true },
    });
  });

  it("returns false when an event does not exist", async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(repository.exists("missing")).resolves.toBe(false);
  });

  it("paginates events with calculated skip and take", async () => {
    const events = [{ id: "evt-5" }];
    prisma.event.findMany.mockResolvedValue(events);

    await expect(repository.findAll(3, 10)).resolves.toBe(events as never);
    expect(prisma.event.findMany).toHaveBeenCalledWith({
      skip: 20,
      take: 10,
      include: {
        detail: true,
      },
    });
  });

  it("updates an event and its details in a transaction when detail data is present", async () => {
    const updatedEvent = { id: "evt-6", detail: { city: "Warsaw" } };
    const tx = {
      event: {
        update: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValue(updatedEvent),
      },
      eventDetail: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
    };
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const details = {
      city: "Warsaw",
      venue: "PGE Narodowy",
    };

    await expect(
      repository.update(
        "evt-6",
        { description: "Updated description" },
        details,
      ),
    ).resolves.toBe(updatedEvent as never);
    expect(tx.event.update).toHaveBeenCalledWith({
      where: { id: "evt-6" },
      data: {
        description: "Updated description",
        status: undefined,
      },
    });
    expect(tx.eventDetail.upsert).toHaveBeenCalledWith({
      where: { id: "evt-6" },
      update: {
        startAt: undefined,
        endsAt: undefined,
        country: undefined,
        city: "Warsaw",
        region: undefined,
        postalCode: undefined,
        address: undefined,
        venue: "PGE Narodowy",
      },
      create: {
        id: "evt-6",
        startAt: undefined,
        endsAt: undefined,
        country: undefined,
        city: "Warsaw",
        region: undefined,
        postalCode: undefined,
        address: undefined,
        venue: "PGE Narodowy",
      },
    });
    expect(tx.event.findUnique).toHaveBeenCalledWith({
      where: { id: "evt-6" },
      include: { detail: true },
    });
  });

  it("updates only the event when no detail fields are provided", async () => {
    const updatedEvent = { id: "evt-7", detail: null };
    const tx = {
      event: {
        update: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValue(updatedEvent),
      },
      eventDetail: {
        upsert: jest.fn(),
      },
    };
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      repository.update("evt-7", { status: "archived" }, {}),
    ).resolves.toBe(updatedEvent as never);
    expect(tx.event.update).toHaveBeenCalledWith({
      where: { id: "evt-7" },
      data: {
        description: undefined,
        status: "archived",
      },
    });
    expect(tx.eventDetail.upsert).not.toHaveBeenCalled();
  });

  it("throws when the updated event cannot be loaded after transaction", async () => {
    const tx = {
      event: {
        update: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      eventDetail: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
    };
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      repository.update("evt-8", {}, { city: "Warsaw" }),
    ).rejects.toThrow("Event not found after update");
  });
});
