import React from "react";
import {
  themeSystem,
  ButtonVariant,
  ButtonSize,
  CardVariant,
  BadgeVariant,
  FlashType,
  TypographyVariant,
} from "../../lib/themeSystem";
import { UIButtonSpinner } from "./UISpinner";

export interface UIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. Sized by the button's size token — pass a bare lucide icon. */
  icon?: React.ReactNode;
  /** Trailing icon, e.g. an arrow on a "continue" action. */
  iconRight?: React.ReactNode;
  /** Swaps the leading icon for a spinner and blocks input. */
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const UIButton: React.FC<UIButtonProps> = ({
  variant = "primary" as ButtonVariant,
  size = "md" as ButtonSize,
  icon,
  iconRight,
  isLoading = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={themeSystem.button(variant, size, `${width} ${className}`)}
      // A button mid-request must not fire twice, so loading implies disabled.
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <UIButtonSpinner /> : icon}
      {children}
      {!isLoading && iconRight}
    </button>
  );
};

export interface UICardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const UICard: React.FC<UICardProps> = ({ variant = "default" as CardVariant, children, className = "", ...props }) => {
  return (
    <div className={themeSystem.card(variant, className)} {...props}>
      {children}
    </div>
  );
};

export interface UIBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const UIBadge: React.FC<UIBadgeProps> = ({ variant = "primary" as BadgeVariant, children, className = "", ...props }) => {
  return (
    <span className={themeSystem.badge(variant, className)} {...props}>
      {children}
    </span>
  );
};

export interface UIFlashMessageProps {
  type?: FlashType;
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void;
}

export const UIFlashMessage: React.FC<UIFlashMessageProps> = ({
  type = "info" as FlashType,
  title,
  message,
  className = "",
  onClose,
}) => {
  return (
    <div className={themeSystem.flash(type, className)}>
      <div className="flex-1">
        {title && <h5 className="font-semibold text-sm mb-0.5">{title}</h5>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100 text-sm font-bold px-1.5 py-0.5">
          &times;
        </button>
      )}
    </div>
  );
};

export interface UIModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const UIModal: React.FC<UIModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div className={themeSystem.modal.overlay} onClick={onClose}>
      <div className={`${themeSystem.modal.content} ${maxWidth}`} onClick={(e) => e.stopPropagation()}>
        <div className={themeSystem.modal.header}>
          <h3 className={themeSystem.typography("h3")}>{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg font-bold p-1 rounded-lg"
          >
            &times;
          </button>
        </div>
        <div className={themeSystem.modal.body}>{children}</div>
        {footer && <div className={themeSystem.modal.footer}>{footer}</div>}
      </div>
    </div>
  );
};

export interface UIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "danger" | "primary";
}

export const UIDialog: React.FC<UIDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "primary",
}) => {
  if (!isOpen) return null;

  return (
    <div className={themeSystem.dialog.overlay} onClick={onClose}>
      <div className={themeSystem.dialog.content} onClick={(e) => e.stopPropagation()}>
        <div>
          <h3 className={themeSystem.typography("h3")}>{title}</h3>
          <p className={`${themeSystem.typography("body-sm")} mt-1`}>{description}</p>
        </div>
        <div className={themeSystem.dialog.actions}>
          <UIButton variant="secondary" size="sm" onClick={onClose}>
            {cancelText}
          </UIButton>
          <UIButton variant={variant === "danger" ? "danger" : "primary"} size="sm" onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </UIButton>
        </div>
      </div>
    </div>
  );
};

export interface UITypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const UITypography: React.FC<UITypographyProps> = ({
  variant = "body" as TypographyVariant,
  children,
  className = "",
  as: Component = "p",
}) => {
  const Tag = Component || "p";
  return <Tag className={themeSystem.typography(variant, className)}>{children}</Tag>;
};
