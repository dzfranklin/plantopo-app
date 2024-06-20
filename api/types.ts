import { z } from 'zod';

export class NetworkError extends Error {
  constructor(public options: FetchOptions<unknown>) {
    super('Network error');
    this.name = 'NetworkError';
  }
}

export class ServerError extends Error {
  constructor(
    public options: FetchOptions<unknown>,
    public requestID: string,
    public response: Response,
    public body?: string,
  ) {
    super(
      `${response.status} ${response.statusText} ${response.url} [${requestID}]: ${body}`,
    );
    this.name = 'ServerError';
  }

  get status() {
    return this.response.status;
  }
}

export class AuthorizationError extends Error {
  constructor(
    public options: FetchOptions<unknown>,
    public requestID: string,
  ) {
    super(`${options.path} [${requestID}]`);
    this.name = 'AuthorizationError';
  }
}

export const ResponseSchema = z.object({
  data: z.unknown(),
});

export interface FetchOptions<T> {
  path: string;
  schema: Zod.Schema<T>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | undefined>;
  body?: Record<string, unknown> | FormData;
}
