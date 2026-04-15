import { ApiPropertyOptional, ApiSchema } from "@nestjs/swagger";

import { EventCreatedDto } from "./event-created.dto";
@ApiSchema({
  name: "Event",
  description: "Response body for an event.",
})
export class EventDto extends EventCreatedDto {
  @ApiPropertyOptional({
    description: "List of classification tags assigned to the event.",
    type: [String],
    example: ["tech", "meetup"],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: "Country where the event takes place.",
    example: "Poland",
  })
  country?: string;

  @ApiPropertyOptional({
    description: "City where the event takes place.",
    example: "Warsaw",
  })
  city?: string;

  @ApiPropertyOptional({
    description: "Region or state for the event location.",
    example: "Mazowieckie",
  })
  region?: string;

  @ApiPropertyOptional({
    description: "Postal code for the event location.",
    example: "00-001",
  })
  postalCode?: string;

  @ApiPropertyOptional({
    description: "Street address of the event location.",
    example: "Marszalkowska 1",
  })
  address?: string;

  @ApiPropertyOptional({
    description: "Venue name where the event is hosted.",
    example: "PGE Narodowy",
  })
  venue?: string;

  @ApiPropertyOptional({
    description: "Event start date and time in ISO 8601 format.",
    type: String,
    format: "date-time",
    example: "2026-06-15T18:00:00.000Z",
  })
  startAt?: Date;

  @ApiPropertyOptional({
    description: "Event end date and time in ISO 8601 format.",
    type: String,
    format: "date-time",
    example: "2026-06-15T22:00:00.000Z",
  })
  endAt?: Date;
}
