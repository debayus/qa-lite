import { createPortal } from "react-dom";
import { BTN_SECONDARY, BTN_DANGER, BTN_PRIMARY } from "@/constants";

interface Props {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCancel} className={BTN_SECONDARY}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={danger ? BTN_DANGER : BTN_PRIMARY}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
