import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { UpdateEventDto } from "./update-event.dto";

describe("UpdateEventDto", () => {
  it("transforms ISO date strings into Date objects and passes validation", async () => {
    const dto = plainToInstance(UpdateEventDto, {
      description: "Updated description",
      startAt: "2026-06-15T18:00:00.000Z",
      endAt: "2026-06-15T22:00:00.000Z",
      city: "Warsaw",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.startAt).toBeInstanceOf(Date);
    expect(dto.endAt).toBeInstanceOf(Date);
  });

  it("fails validation for invalid date values", async () => {
    const dto = plainToInstance(UpdateEventDto, {
      startAt: "not-a-date",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe("startAt");
  });
});
