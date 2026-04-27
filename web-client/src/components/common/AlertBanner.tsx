const STYLES = {
  warning: {
    wrap: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: "⚠",
  },
  error: { wrap: "bg-red-50 border-red-200", text: "text-red-700", icon: "✕" },
  info: {
    wrap: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: "ℹ",
  },
} as const;

interface Props {
  message: React.ReactNode;
  variant?: keyof typeof STYLES;
}

export default function AlertBanner({ message, variant = "warning" }: Props) {
  const s = STYLES[variant];
  return (
    <div
      className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${s.wrap}`}
    >
      <span className={`text-base mt-0.5 shrink-0 ${s.text}`}>{s.icon}</span>
      <p className={`text-sm ${s.text}`}>{message}</p>
    </div>
  );
}
