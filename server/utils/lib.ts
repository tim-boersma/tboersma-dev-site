
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if ((error as any)?.originalError?.isAxiosError === true) {
    return (error as any).originalError as Error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  return new Error(String(error));
};