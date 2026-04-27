interface Props {
  text?: string;
  className?: string;
}

export default function LoadingState({ text = "Loading...", className }: Props) {
  return (
    <div
      className={`text-sm text-gray-400 py-12 text-center ${className ?? ""}`}
    >
      {text}
    </div>
  );
}
