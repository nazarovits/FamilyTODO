import { useEffect, useId, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  yesText?: string;
  noText?: string;
  isBusy?: boolean;
  errorMessage?: string | null;
  onYesPressed: () => void;
  onNoPressed: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  yesText = "Yes",
  noText = "No",
  isBusy = false,
  errorMessage,
  onYesPressed,
  onNoPressed,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      aria-labelledby={titleId}
      aria-describedby={messageId}
      className="confirm-dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (!isBusy) {
          onNoPressed();
        }
      }}
      ref={dialogRef}
    >
      <button
        aria-label="Close confirmation"
        className="confirm-dialog-close"
        disabled={isBusy}
        onClick={onNoPressed}
        type="button"
      >
        <span aria-hidden="true">&times;</span>
      </button>
      <div className="confirm-dialog-content">
        <h2 className="confirm-dialog-title" id={titleId}>
          {title}
        </h2>
        <p className="confirm-dialog-message" id={messageId}>
          {message}
        </p>
        {errorMessage && (
          <p className="confirm-dialog-error" role="alert">
            {errorMessage}
          </p>
        )}
        <div className="confirm-dialog-actions">
          <button
            className="confirm-dialog-button confirm-dialog-button--secondary"
            disabled={isBusy}
            onClick={onNoPressed}
            type="button"
          >
            {noText}
          </button>
          <button
            className="confirm-dialog-button confirm-dialog-button--primary"
            disabled={isBusy}
            onClick={onYesPressed}
            type="button"
          >
            {isBusy ? "Please wait..." : yesText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
