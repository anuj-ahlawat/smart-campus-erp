"use client";

import axios, { AxiosRequestConfig } from "axios";
import { useCallback } from "react";
import { API_BASE_URL } from "@/src/lib/routes";
import { handleApiErrors } from "@/src/lib/handleErrors";
import { useAuth } from "./useAuth";

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export const useApi = () => {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const request = useCallback(
    async <T = unknown>(config: AxiosRequestConfig): Promise<T | undefined> => {
      const execute = (token?: string | null) =>
        client<T>({
          ...config,
          headers: {
            ...(config.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

      try {
        const response = await execute(accessToken);
        return response.data;
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          const nextToken = await refreshAccessToken();
          if (nextToken) {
            try {
              const retry = await execute(nextToken);
              return retry.data;
            } catch (retryError) {
              handleApiErrors(retryError);
              return undefined;
            }
          }
          await logout();
        }
        handleApiErrors(error);
        return undefined;
      }
    },
    [accessToken, logout, refreshAccessToken]
  );

  return { request };
};

