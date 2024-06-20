export function useFormattedLength(valueMeters?: number): string | undefined {
  if (valueMeters === undefined) {
    return undefined;
  }

  return (valueMeters / 1000).toLocaleString('en-US', {
    minimumFractionDigits: 2,
  });
}

export function useFormattedElevation(
  valueMeters?: number,
): string | undefined {
  if (valueMeters === undefined) {
    return undefined;
  }

  return valueMeters.toLocaleString('en-US', {
    minimumFractionDigits: 0,
  });
}
