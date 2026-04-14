import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { EventCreatedDto } from "./dtos/event-created.dto";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CreateEventDto } from "./dtos/create-event.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateEventCommand } from "./commands/create-event.command";
import { EventDto } from "./dtos/event.dto";
import { GetEventQuery } from "./queries/get-event.query";
import { GetEventsQuery } from "./queries/get-events.query";
import { UpdateEventDto } from "./dtos/update-event.dto";
import { UpdateEventDetailsCommand } from "./commands/update-event-details.command";
import { UpdateEventStatusCommand } from "./commands/update-event-status.command";
import { UpdateEventStatusDto } from "./dtos/update-event-status.dto";

@ApiTags("events")
@Controller({ path: "events", version: "1" })
export class EventsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create a new event",
    description:
      "Creates a new event assigned to the user identified by the provided email.",
  })
  @ApiBody({
    type: CreateEventDto,
    description: "Payload required to create a new event.",
  })
  @ApiCreatedResponse({
    description: "The event has been successfully created.",
    type: EventCreatedDto,
  })
  @ApiBadRequestResponse({
    description: "The request body is invalid or missing required fields.",
  })
  public async createEvent(
    @Body() request: CreateEventDto,
  ): Promise<EventCreatedDto> {
    const command = new CreateEventCommand(
      request.name,
      request.email,
      request.description,
    );
    const result = await this.commandBus.execute(command);
    return {
      id: result.id,
      name: result.name,
      slug: result.slug,
      description: result.description,
    } as EventCreatedDto;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get event by id" })
  @ApiOkResponse({
    description: "The event has been successfully retrieved.",
    type: EventDto,
  })
  @ApiNotFoundResponse({
    description: "Event not found.",
  })
  public async getEvent(@Param("id") id: string): Promise<EventDto> {
    const query = new GetEventQuery(id);
    return this.queryBus.execute(query);
  }

  @Get()
  @ApiOperation({ summary: "Get all events" })
  @ApiOkResponse({
    description: "The events have been successfully retrieved.",
    type: [EventDto],
  })
  public async getEvents(
    @Query("page") page: number,
    @Query("limit") limit: number,
  ): Promise<EventDto[]> {
    const query = new GetEventsQuery(page, limit);
    return this.queryBus.execute(query);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update event details" })
  @ApiOkResponse({
    description: "The event details have been successfully updated.",
    type: EventDto,
  })
  @ApiBadRequestResponse({
    description: "The request body is invalid or missing required fields.",
  })
  @ApiNotFoundResponse({
    description: "Event not found.",
  })
  public async updateEventDetails(
    @Param("id") id: string,
    @Body() request: UpdateEventDto,
  ): Promise<EventDto> {
    const command = new UpdateEventDetailsCommand(
      id,
      request.description,
      request.startAt,
      request.endAt,
      request.country,
      request.city,
      request.region,
      request.postalCode,
      request.address,
      request.venue,
    );

    const result = await this.commandBus.execute(command);
    return {
      id: result.id,
      name: result.name,
      slug: result.slug,
      description: result.description ?? undefined,
      country: result.detail?.country ?? undefined,
      city: result.detail?.city ?? undefined,
      region: result.detail?.region ?? undefined,
      postalCode: result.detail?.postalCode ?? undefined,
      address: result.detail?.address ?? undefined,
      venue: result.detail?.venue ?? undefined,
      startAt: result.detail?.startAt ?? undefined,
      endAt: result.detail?.endsAt ?? undefined,
    } as EventDto;
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update event status" })
  @ApiOkResponse({
    description: "The event status has been successfully updated.",
    type: EventCreatedDto,
  })
  @ApiBadRequestResponse({
    description: "The request body is invalid or missing required fields.",
  })
  @ApiNotFoundResponse({
    description: "Event not found.",
  })
  public async updateEventStatus(
    @Param("id") id: string,
    @Body() request: UpdateEventStatusDto,
  ): Promise<EventCreatedDto> {
    const command = new UpdateEventStatusCommand(id, request.status);
    const result = await this.commandBus.execute(command);
    return {
      id: result.id,
      name: result.name,
      slug: result.slug,
      description: result.description,
    } as EventCreatedDto;
  }
}
