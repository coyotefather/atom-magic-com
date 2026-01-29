import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle, mdiInformation } from '@mdi/js';

type Variant = 'success' | 'error' | 'warning' | 'info';
type Size = 'inline' | 'full';

interface StatusMessageProps {
  /** Visual style variant */
  variant: Variant;
  /** Display size: 'inline' for form errors, 'full' for page-level messages */
  size?: Size;
  /** Optional title (displayed in full size only) */
  title?: string;
  /** Main message text */
  message: string;
  /** Optional actions (buttons, links) rendered below message */
  children?: React.ReactNode;
  /** Additional className */
  className?: string;
}

// Full class strings for Tailwind JIT compatibility
const variantConfig: Record<Variant, {
  bg: string;
  border: string;
  text: string;
  icon: string;
}> = {
  success: {
    bg: 'bg-laurel/10',
    border: 'border-laurel',
    text: 'text-laurel',
    icon: mdiCheckCircle,
  },
  error: {
    bg: 'bg-oxblood/10',
    border: 'border-oxblood',
    text: 'text-oxblood',
    icon: mdiAlertCircle,
  },
  warning: {
    bg: 'bg-bronze/10',
    border: 'border-bronze',
    text: 'text-bronze',
    icon: mdiAlertCircle,
  },
  info: {
    bg: 'bg-gold/10',
    border: 'border-gold',
    text: 'text-gold',
    icon: mdiInformation,
  },
};

/**
 * Status message component for success, error, warning, and info states
 *
 * @example
 * // Inline error (form validation)
 * <StatusMessage variant="error" message="Please fill in all fields" />
 *
 * @example
 * // Full success message with action
 * <StatusMessage variant="success" size="full" title="Message Sent" message="We'll get back to you soon.">
 *   <button onClick={reset}>Send another</button>
 * </StatusMessage>
 *
 * @example
 * // Warning with link
 * <StatusMessage variant="warning" size="full" title="High Volume" message="Please try again later.">
 *   <a href="mailto:contact@example.com">Email us directly</a>
 * </StatusMessage>
 */
const StatusMessage = ({
  variant,
  size = 'inline',
  title,
  message,
  children,
  className = '',
}: StatusMessageProps) => {
  const { bg, border, text, icon } = variantConfig[variant];

  if (size === 'full') {
    return (
      <div className={`${bg} border-2 ${border} p-8 text-center ${className}`}>
        <Icon path={icon} size={2} className={`${text} mx-auto mb-4`} />
        {title && (
          <h3 className={`text-xl marcellus ${text} mb-2`}>{title}</h3>
        )}
        <p className="text-charcoal dark:text-parchment">{message}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`${bg} border-2 ${border} p-4 flex items-center gap-3 ${className}`}>
      <Icon path={icon} size={1} className={`${text} flex-shrink-0`} />
      <p className={text}>{message}</p>
    </div>
  );
};

export default StatusMessage;
