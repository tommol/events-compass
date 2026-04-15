import { Body, Controller, Get, HttpCode, Param, Post, Put, Query } from "@nestjs/common";
import { EventCreatedDto } from "./dtos/event-created.dto";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CreateEventDto } from "./dtos/create-event.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateEventCommand } from "./commands/create-event.command";
import { EventDto } from "./dtos/event.dto";
import { GetEventByTokenQuery } from "./queries/get-event-by-token.query";
import { GetEventQuery } from "./queries/get-event.query";
import { GetEventsQuery } from "./queries/get-events.query";
import { UpdateEventDto } from "./dtos/update-event.dto";
import { UpdateEventDetailsCommand } from "./commands/update-event-details.command";
import { UpdateEventStatusCommand } from "./commands/update-event-status.command";
import { UpdateEventStatusDto } from "./dtos/update-event-status.dto";
import { UpdateEventRequestCommand } from "./commands/update-event-request.command";
import { EditEventRequestDto } from "./dtos/edit-event-request.dto";

@ApiTags("events")
@Controller({ path: "events", version: "1" })
export class EventsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

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

  @Get("token/:id")
  @ApiOperation({ summary: "Get event by edit token" })
  @ApiOkResponse({
    description: "The event has been successfully retrieved by token.",
    type: EventDto,
  })
  @ApiNotFoundResponse({
    description: "Event not found or token expired.",
  })
  public async getEventByToken(@Param("id") id: string): Promise<EventDto> {
    const query = new GetEventByTokenQuery(id);
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
      request.token,
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

  @Post(":id/request-edit")
  @HttpCode(204)
  @ApiOperation({
    summary: "Request edit token for an event",
    description:
      "Requests an edit token for the specified event. The token will be sent to the provided email if the user is authorized to edit the event.",
  })
  @ApiNoContentResponse({
    description: "Edit token request accepted.",
  })
  @ApiBadRequestResponse({
    description: "The request body is invalid or missing required fields.",
  })
  @ApiNotFoundResponse({
    description: "Event not found.",
  })
  @ApiForbiddenResponse({
    description: "User is not authorized to edit this event.",
  })
  public async requestEditEvent(@Param("id") id: string, @Body() request: EditEventRequestDto): Promise<void> {
    const command = new UpdateEventRequestCommand(request.email, id);
    await this.commandBus.execute(command);
  }
}
