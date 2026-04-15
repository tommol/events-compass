import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional, ApiSchema } from "@nestjs/swagger";
import { IsDate, IsOptional, IsString } from "class-validator";

@ApiSchema({
  name: "UpdateEventRequest",
  description: "Request body for updating event details.",
})
export class UpdateEventDto {
  @ApiProperty({
    description: "One-time edit token sent by email.",
    example: "8f3c9d2f7b1a...",
  })
  @IsString()
  token!: string;

  @ApiPropertyOptional({
    description: "Optional short summary shown in listings and previews.",
    example: "An evening meetup about modern frontend architecture.",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Country where the event takes place.",
    example: "Poland",
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: "City where the event takes place.",
    example: "Warsaw",
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: "Region or state for the event location.",
    example: "Mazowieckie",
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: "Postal code for the event location.",
    example: "00-001",
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    description: "Street address of the event location.",
    example: "Marszalkowska 1",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: "Venue name where the event is hosted.",
    example: "PGE Narodowy",
  })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({
    description: "Event start date and time in ISO 8601 format.",
    type: String,
    format: "date-time",
    example: "2026-06-15T18:00:00.000Z",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startAt?: Date;

  @ApiPropertyOptional({
    description: "Event end date and time in ISO 8601 format.",
    type: String,
    format: "date-time",
    example: "2026-06-15T22:00:00.000Z",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endAt?: Date;
}
