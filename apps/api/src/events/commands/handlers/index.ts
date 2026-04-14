import { CreateEventCommandHandler } from "./create-event.handler";
import { UpdateEventDetailsCommandHandler } from "./update-event-details.handler";
import { UpdateEventStatusCommandHandler } from "./update-event-status.handler";

export const CommandHandlers = [
  CreateEventCommandHandler,
  UpdateEventDetailsCommandHandler,
  UpdateEventStatusCommandHandler,
];
