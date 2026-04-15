import type { HealthResponse } from '@events-compass/shared';

const API_URL = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1')
  : '/api/v1';

type ApiEventDto = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  address?: string;
  venue?: string;
  startAt?: string;
  endAt?: string;
};

export type EventViewModel = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  address?: string;
  venue?: string;
  startAt?: string;
  endAt?: string;
};

export type UpdateEventPayload = {
  description?: string;
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  address?: string;
  venue?: string;
  startAt?: string;
  endAt?: string;
};

export type RequestEditTokenPayload = {
  email: string;
};

export type CreateEventPayload = {
  name: string;
  email: string;
  description?: string;
};

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string | null };

export async function fetchHealthStatus(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export async function getEventBySlug(eventSlug: string): Promise<ApiResult<EventViewModel>> {
  return fetchApi<EventViewModel>(`/events/${eventSlug}`);
}

export async function searchEvents(
  query: string,
  page: number = 1,
  limit: number = 12,
): Promise<ApiResult<EventViewModel[]>> {
  const searchParams = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit),
  });

  return fetchApi<EventViewModel[]>(`/events/search?${searchParams.toString()}`);
}

export async function getEventByToken(tokenHash: string): Promise<ApiResult<EventViewModel>> {
  return fetchApi<EventViewModel>(`/events/token/${tokenHash}`);
}

export async function requestEditToken(
  eventSlug: string,
  payload: RequestEditTokenPayload,
): Promise<ApiResult<null>> {
  return fetchApi<null>(`/events/${eventSlug}/request-edit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createEvent(payload: CreateEventPayload): Promise<ApiResult<EventViewModel>> {
  return fetchApi<EventViewModel>('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEvent(
  eventSlug: string,
  tokenHash: string,
  payload: UpdateEventPayload,
): Promise<ApiResult<EventViewModel>> {
  return fetchApi<EventViewModel>(`/events/${eventSlug}`, {
    method: 'PUT',
    body: JSON.stringify({
      token: tokenHash,
      ...payload,
    }),
  });
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await parseError(response),
      };
    }

    if (response.status === 204) {
      return {
        ok: true,
        status: response.status,
        data: null as T,
      };
    }

    const payload = (await response.json()) as ApiEventDto | T;

    return {
      ok: true,
      status: response.status,
      data: toViewModel(payload as T),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      error: null,
    };
  }
}

async function parseError(response: Response): Promise<string | null> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    const message = payload.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message ?? null;
  } catch {
    return null;
  }
}

function toViewModel<T>(payload: T): T {
  if (Array.isArray(payload)) {
    const events = payload.map((item) => (isApiEventDto(item) ? toEventViewModel(item) : item));
    return events as T;
  }

  if (!isApiEventDto(payload)) {
    return payload;
  }

  return toEventViewModel(payload) as T;
}

function toEventViewModel(payload: ApiEventDto): EventViewModel {
  const event: EventViewModel = {
    id: payload.id,
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    country: payload.country,
    city: payload.city,
    region: payload.region,
    postalCode: payload.postalCode,
    address: payload.address,
    venue: payload.venue,
    startAt: payload.startAt,
    endAt: payload.endAt,
  };

  return event;
}

function isApiEventDto(payload: unknown): payload is ApiEventDto {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as { id?: unknown; name?: unknown; slug?: unknown };

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.slug === 'string'
  );
}
