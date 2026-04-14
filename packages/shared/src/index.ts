export type HealthResponse = {
  status: 'ok';
  service: 'api';
  database: 'up' | 'down';
  timestamp: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresInSeconds: number;
  tokenType: 'Bearer';
};
