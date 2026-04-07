import { useRef } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.ComponentPropsWithRef<'input'>, 'size'> {
  allowClear?: boolean;
  size?: 'small' | 'middle' | 'large';
  variant?: 'default' | 'search';
}

const sizeClasses: Record<NonNullable<InputProps['size']>, string> = {
  small: 'h-8 px-3 text-[12px]',
  middle: 'h-9 px-3.5 text-[13px]',
  large: 'h-10 px-4 text-[14px]',
};

function Input({
  allowClear,
  size = 'middle',
  variant: _variant = 'default',
  className,
  value,
  onChange,
  ref,
  ...props
}: InputProps) {
    const innerRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || innerRef;

    const handleClear = (): void => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;

      if (nativeInputValueSetter && inputRef.current) {
        nativeInputValueSetter.call(inputRef.current, '');
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={cn('relative inline-flex items-center', className)}>
        <input
          ref={inputRef}
          className={cn(
            'w-full rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] placeholder:text-[var(--text-muted)] transition-[background-color,border-color,box-shadow] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(124,127,242,0.18)]',
            sizeClasses[size],
            allowClear && value ? 'pr-7' : ''
          )}
          value={value}
          onChange={onChange}
          {...props}
        />
        {allowClear && value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1.5 flex h-4 w-4 items-center justify-center rounded-[var(--card-radius)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <X size={12} />
          </button>
        ) : null}
      </div>
    );
  }

export { Input };
