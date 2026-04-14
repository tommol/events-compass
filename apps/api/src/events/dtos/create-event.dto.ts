import { ApiProperty, ApiPropertyOptional, ApiSchema } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";
@ApiSchema({
  name: "CreateEventRequest",
  description: "Request body for creating a new event.",
})
export class CreateEventDto {
  @ApiProperty({
    description: "Public name of the event.",
    example: "Frontend Masters Meetup Warsaw",
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: "Optional short summary shown in listings and previews.",
    example: "An evening meetup about modern frontend architecture.",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Email address of the user creating the event.",
    example: "organizer@example.com",
  })
  @IsEmail()
  email!: string;
}
