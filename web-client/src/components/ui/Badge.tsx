import { cn } from "@/lib/utils/cn";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function Badge({ className, children }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}
