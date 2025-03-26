import axios, { AxiosError } from "axios";
import {
  GenericResponseSchema,
  UserSchema,
  validateResponse,
  CharacterSchema,
} from "./validations";
import { z } from "zod";

class APIError extends Error {
  constructor(message: string, public status: number, public code: string) {
    super(message);
    this.name = "APIError";
  }
}

export const apiProxy = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add telegram user data to every request
apiProxy.interceptors.request.use((config) => {
  const originalUrl = config.url;
  config.url = "";
  config.data = {
    path: originalUrl,
    method: config.method?.toUpperCase(),
    data: config.data,
  };

  return config;
});

// Response validation and error handling
apiProxy.interceptors.response.use(
  (response) => {
    if (!response.data) {
      throw new Error("No response data");
    }

    // if response is an array buffer or SSE, return it as is
    if (
      response.headers["content-type"]?.includes("audio/") ||
      response.headers["content-type"]?.includes("text/event-stream")
    ) {
      return response;
    }

    try {
      const genericResponse = GenericResponseSchema.parse(response.data);
      if (
        response.config.url?.includes("/user") &&
        response.config.method === "GET"
      ) {
        response.data = validateResponse(genericResponse, UserSchema);
      }

      if (
        response.config.url?.includes("/characters") &&
        response.config.method === "GET"
      ) {
        response.data = validateResponse(
          genericResponse,
          z.array(CharacterSchema)
        );
      }

      // if status is not 2xx, throw an error
      if (genericResponse.status < 200 || genericResponse.status >= 300) {
        throw new APIError(
          genericResponse.message,
          genericResponse.status,
          "API_ERROR"
        );
      }

      return response;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError("Invalid response data", 500, "VALIDATION_ERROR");
      }
      throw error;
    }
  },
  (error: AxiosError<any>) => {
    if (error.response?.data) {
      try {
        const errorResponse = GenericResponseSchema.parse(error.response.data);
        console.log("errorResponse", errorResponse);
        throw new APIError(
          errorResponse.message,
          errorResponse.status,
          "API_ERROR"
        );
      } catch {
        console.log("catch", error);
        throw new APIError(
          error.response.data.message || "An error occurred",
          error.response.status || 500,
          "UNKNOWN_ERROR"
        );
      }
    }
    throw error;
  }
);
