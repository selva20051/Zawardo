import { Response } from 'express';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export const sendResponse = <T>(
  res: Response,
  {
    success = true,
    data = null,
    message = '',
    error = '',
    statusCode = 200,
  }: {
    success?: boolean;
    data?: T;
    message?: string;
    error?: string;
    statusCode?: number;
  }
) => {
  const response: ApiResponse<T> = {
    success,
  };

  if (data) response.data = data;
  if (message) response.message = message;
  if (error) response.error = error;

  return res.status(statusCode).json(response);
};
