import { GetEventByTokenQueryHandler } from "./get-event-by-token.handler";
import { GetEventQueryHandler } from "./get-event.handler";
import { GetEventsQueryHandler } from "./get-events.handler";
import { SearchEventsQueryHandler } from "./search-events.handler";

export const QueryHandlers = [
	GetEventByTokenQueryHandler,
	GetEventQueryHandler,
	GetEventsQueryHandler,
	SearchEventsQueryHandler,
];
