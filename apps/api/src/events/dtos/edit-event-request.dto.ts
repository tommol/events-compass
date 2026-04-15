import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({
    name: "EditEventRequest",
    description: "Request body for requesting an edit token for an event.",
})
export class EditEventRequestDto {
    @ApiProperty({
        description: "Email address of the user requesting the edit token.",
        example: "someaone@somwewher.com"})
    email!: string;
}