import { monotonicFactory } from 'ulid';
import {
  AuthorizationError,
  FetchOptions,
  NetworkError,
  ResponseSchema,
  ServerError,
} from './types';
import { API_ENDPOINT } from '../env';

const requestIDFactory = monotonicFactory();

export async function baseApiFetch<T>(
  options: FetchOptions<T> & { accessToken?: string },
): Promise<T> {
  const requestID = requestIDFactory();

  const url = new URL(API_ENDPOINT + options.path);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value === undefined) continue;
      url.searchParams.append(key, value);
    }
  }

  const headers: HeadersInit = {};
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`;
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const method = options.method ?? (options.body ? 'POST' : 'GET');

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body:
        options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body),
    });
  } catch (error) {
    console.error(error);
    throw new NetworkError(options);
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthorizationError(options, requestID);
    }
    let body: string | undefined;
    try {
      body = await response.text();
    } catch (error) {
      // Ignore
    }
    throw new ServerError(options, requestID, response, body);
  }

  const responseJSON = await response.json();
  const resp = ResponseSchema.parse(responseJSON);
  return options.schema.parse(resp.data);
}
