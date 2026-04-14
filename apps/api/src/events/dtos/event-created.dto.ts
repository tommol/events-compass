import { ApiProperty, ApiPropertyOptional, ApiSchema } from "@nestjs/swagger";

@ApiSchema({
  name: "EventResponse",
  description: "Response body for a successfully modified event.",
})
export class EventCreatedDto {
  @ApiProperty({
    description: "Unique event identifier.",
    example: "cm9z6h0m70000v6c8gk9w1p2q",
  })
  id!: string;

  @ApiProperty({
    description: "Public name of the event.",
    example: "Frontend Masters Meetup Warsaw",
  })
  name!: string;

  @ApiProperty({
    description: "URL-friendly unique event slug.",
    example: "frontend-masters-meetup-warsaw",
  })
  slug!: string;

  @ApiPropertyOptional({
    description: "Optional short summary of the event.",
    example: "An evening meetup about modern frontend architecture.",
  })
  description?: string;
}
