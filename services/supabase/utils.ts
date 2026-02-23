export const throwIfError = (error: unknown, message?: string) => {
  if (!error) return;
  if (error instanceof Error) {
    throw error;
  }
  if (typeof error === 'object' && error !== null) {
    const maybe = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };
    const parts = [
      typeof maybe.message === 'string' ? maybe.message : null,
      typeof maybe.details === 'string' ? maybe.details : null,
      typeof maybe.hint === 'string' ? `hint: ${maybe.hint}` : null,
      typeof maybe.code === 'string' ? `code: ${maybe.code}` : null
    ].filter(Boolean) as string[];
    if (parts.length > 0) {
      throw new Error(parts.join(' | '));
    }
  }
  throw new Error(message || 'Supabase request failed');
};

export const toNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};
