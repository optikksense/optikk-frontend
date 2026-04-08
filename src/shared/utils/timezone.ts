/**
 * Timezone formatting utilities.
 *
 * Uses the Intl API to format dates in any IANA timezone,
 * with date-fns for local time formatting.
 */

import { format as dateFnsFormat } from "date-fns";

/**
 * Format a Date or Unix ms timestamp in the given timezone.
 *
 * @param dateOrMs  Date object or Unix ms timestamp
 * @param tz        IANA timezone string (e.g. 'America/New_York', 'UTC') or 'local'
 * @param fmt       Format string: 'datetime' | 'date' | 'time' | 'iso'
 */
export function formatInTimezone(
  dateOrMs: Date | number,
  tz: string,
  fmt: "datetime" | "date" | "time" | "iso" = "datetime"
): string {
  const date = typeof dateOrMs === "number" ? new Date(dateOrMs) : dateOrMs;

  if (tz === "local") {
    return formatLocal(date, fmt);
  }

  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: tz,
      hour12: false,
    };

    switch (fmt) {
      case "date":
        options.year = "numeric";
        options.month = "2-digit";
        options.day = "2-digit";
        break;
      case "time":
        options.hour = "2-digit";
        options.minute = "2-digit";
        options.second = "2-digit";
        break;
      default:
        options.year = "numeric";
        options.month = "2-digit";
        options.day = "2-digit";
        options.hour = "2-digit";
        options.minute = "2-digit";
        break;
    }

    const formatter = new Intl.DateTimeFormat("sv-SE", options);
    return formatter.format(date);
  } catch {
    // Fallback if timezone is invalid
    return formatLocal(date, fmt);
  }
}

function formatLocal(date: Date, fmt: "datetime" | "date" | "time" | "iso"): string {
  switch (fmt) {
    case "date":
      return dateFnsFormat(date, "yyyy-MM-dd");
    case "time":
      return dateFnsFormat(date, "HH:mm:ss");
    case "iso":
      return dateFnsFormat(date, "yyyy-MM-dd'T'HH:mm:ss");
    default:
      return dateFnsFormat(date, "yyyy-MM-dd HH:mm");
  }
}

/**
 * Get the short timezone abbreviation for display.
 * e.g. 'EST', 'UTC', 'PST'
 */
export function getTimezoneAbbr(tz: string): string {
  if (tz === "local") {
    try {
      return (
        new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
          .formatToParts(new Date())
          .find((p) => p.type === "timeZoneName")?.value ?? "Local"
      );
    } catch {
      return "Local";
    }
  }
  if (tz === "UTC") return "UTC";
  try {
    return (
      new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? tz
    );
  } catch {
    return tz;
  }
}

/**
 * Common timezone options for the picker.
 */
export const COMMON_TIMEZONES = [
  { value: "local", label: "Local (Browser)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern (US)" },
  { value: "America/Chicago", label: "Central (US)" },
  { value: "America/Denver", label: "Mountain (US)" },
  { value: "America/Los_Angeles", label: "Pacific (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Kolkata", label: "Kolkata (IST)" },
  { value: "Australia/Sydney", label: "Sydney" },
];
