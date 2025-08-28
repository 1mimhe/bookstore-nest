export const parseDecade = (decade: string): { start: number; end: number } => {
  // Remove 's' and extract base year
  const baseYear = parseInt(decade.replace(/s$/, ''), 10);

  if (isNaN(baseYear)) {
    throw new Error(`Invalid decade format: ${decade}.`);
  }

  // Calculate decade boundaries
  const decadeStart = Math.floor(baseYear / 10) * 10;
  const decadeEnd = decadeStart + 9;

  return { start: decadeStart, end: decadeEnd };
};

export const getDateRange = (decade: string): { startDate: Date; endDate: Date } => {
  const { start, end } = parseDecade(decade);

  return {
    startDate: new Date(start, 0, 1),
    endDate: new Date(end, 11, 31, 23, 59, 59, 999),
  };
};
