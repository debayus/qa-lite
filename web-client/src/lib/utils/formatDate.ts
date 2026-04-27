type FirestoreDate = { toDate: () => Date };

export function formatDate(date: unknown): string {
  if (!date) return "—";
  const d =
    typeof (date as FirestoreDate).toDate === "function"
      ? (date as FirestoreDate).toDate()
      : new Date(date as string | number | Date);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
