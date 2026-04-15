export type QueryIntent =
  | 'general_search'
  | 'event_lookup'
  | 'tag_search'
  | 'location_search'
  | 'date_search'
  | 'hybrid';

export type QueryInterpretation = {
  location: string | null;
  eventName: string | null;
  tags: string[];
  dateHint: string | null;
  intent: QueryIntent;
};

export type EventClassification = {
  tagSlugs: string[];
  confidence: number | null;
};

export type EventClassificationInput = {
  name: string;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  venue?: string | null;
};
