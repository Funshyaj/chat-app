export function timeStampGenerator(date: Date) {
  while (true) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12; // Convert 24-hour format to 12-hour format
    const formattedMinutes = minutes.toString().padStart(2, "0"); // Ensure two digits for minutes
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  }
}
