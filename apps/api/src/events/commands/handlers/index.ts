import { CreateEventCommandHandler } from "./create-event.handler";
import { UpdateEventDetailsCommandHandler } from "./update-event-details.handler";
import { UpdateEventRequestCommandHandler } from "./update-event-request.command";
import { UpdateEventStatusCommandHandler } from "./update-event-status.handler";

export const CommandHandlers = [
  CreateEventCommandHandler,
  UpdateEventDetailsCommandHandler,
  UpdateEventRequestCommandHandler,
  UpdateEventStatusCommandHandler,
];
