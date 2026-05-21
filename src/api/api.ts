// api/api.ts

// const BASE_URL =
// "http://localhost:3024/api";

const BASE_URL =
  "https://cyberrajasthan.online/scrb/api/";

type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  headers?: HeadersInit;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
  } = options;

  try {
    const isFormData =
      body instanceof FormData;

    const response =
      await fetch(
        `${BASE_URL}${endpoint}`,
        {
          method,

          headers: isFormData
            ? headers
            : {
                "Content-Type":
                  "application/json",

                ...headers,
              },

          body: body
            ? isFormData
              ? body as FormData
              : JSON.stringify(
                  body
                )
            : undefined,
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "Backend Error:",
        data
      );

      throw new Error(
        data.message ||
          `API Error: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error(
      "API Request Failed:",
      error
    );

    throw error;
  }
}

export const api = {
  get: <T>(
    endpoint: string
  ) => request<T>(endpoint),

  post: <T>(
    endpoint: string,
    body: unknown
  ) =>
    request<T>(endpoint, {
      method: "POST",
      body,
    }),

  put: <T>(
    endpoint: string,
    body: unknown
  ) =>
    request<T>(endpoint, {
      method: "PUT",
      body,
    }),

  patch: <T>(
    endpoint: string,
    body: unknown
  ) =>
    request<T>(endpoint, {
      method: "PATCH",
      body,
    }),

  delete: <T>(
    endpoint: string
  ) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
};