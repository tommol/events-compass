import { CreateEventCommandHandler } from "./create-event.handler";
import { ReclassifyEventCommandHandler } from "./reclassify-event.handler";
import { ReclassifyUnclassifiedEventsCommandHandler } from "./reclassify-unclassified-events.handler";
import { UpdateEventDetailsCommandHandler } from "./update-event-details.handler";
import { UpdateEventRequestCommandHandler } from "./update-event-request.command";
import { UpdateEventStatusCommandHandler } from "./update-event-status.handler";

export const CommandHandlers = [
  CreateEventCommandHandler,
  ReclassifyEventCommandHandler,
  ReclassifyUnclassifiedEventsCommandHandler,
  UpdateEventDetailsCommandHandler,
  UpdateEventRequestCommandHandler,
  UpdateEventStatusCommandHandler,
];
