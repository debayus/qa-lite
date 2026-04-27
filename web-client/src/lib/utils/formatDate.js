export function formatDate(date) {
    if (!date)
        return "—";
    const d = typeof date.toDate === "function"
        ? date.toDate()
        : new Date(date);
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}
