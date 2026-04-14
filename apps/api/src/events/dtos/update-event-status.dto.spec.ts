import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { UpdateEventStatusDto } from "./update-event-status.dto";

describe("UpdateEventStatusDto", () => {
  it("passes validation for allowed statuses", async () => {
    const dto = plainToInstance(UpdateEventStatusDto, {
      status: "archived",
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("fails validation for unsupported statuses", async () => {
    const dto = plainToInstance(UpdateEventStatusDto, {
      status: "draft",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe("status");
  });
});
