/**
 * Formats a number as Bangladeshi Taka (৳).
 * Example: 1500 -> "৳1,500"
 */
export function formatTaka(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num === null || num === undefined || isNaN(num)) {
    return "৳0";
  }
  return `৳${Math.round(num).toLocaleString("en-BD")}`;
}
