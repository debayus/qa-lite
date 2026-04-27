interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  paddingY?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  paddingY = "py-16",
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${paddingY}`}
    >
      {icon && <div className="mb-1">{icon}</div>}
      <div>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {description && (
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
