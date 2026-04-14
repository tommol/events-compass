import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { IsIn } from "class-validator";

@ApiSchema({
  name: "UpdateEventStatusRequest",
  description: "Request body for updating the status of an event.",
})
export class UpdateEventStatusDto {
  @ApiProperty({
    name: "status",
    description: "New status of the event.",
    example: "active",
    enum: ["active", "archived", "deleted"],
  })
  @IsIn(["active", "archived", "deleted"])
  status!: "active" | "archived" | "deleted";
}
