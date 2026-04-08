import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import cn from 'classnames';

import './AppInput.scss';

export type AppInputProps = {
  name?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  variant?: 'standard' | 'search';
  size?: 'sm' | 'md' | 'lg';
  value: string;
  label?: string;
  width?: string;
  placeholder?: string;
  disabled?: boolean;
  touched?: boolean;
  error?: string;
  note?: string;
  style?: React.CSSProperties;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

const AppInput: React.FC<AppInputProps> = ({
  name,
  type = 'text',
  variant = 'standard',
  value,
  label,
  width,
  size = 'md',
  placeholder = 'Enter',
  disabled,
  touched,
  error,
  note,
  style,
  onChange = () => {},
  onBlur = () => {},
}) => {
  const [inputType, setInputType] = useState<AppInputProps['type']>(type);

  const isInputTouched: boolean = touched === undefined || touched;

  const errorMessage: string = isInputTouched && error ? error : '';

  const helperText: string = errorMessage || note || '';

  const className = cn(
    'AppInput__wrapper',
    `AppInput--${type}`,
    `AppInput--${variant}`,
    errorMessage && 'AppInput--error'
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (disabled) return;
    onChange(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (disabled) return;
    onBlur(e);
  };

  const toggleInputType = (): void => {
    setInputType(inputType === 'text' ? 'password' : 'text');
  };

  return (
    <div className={className} style={{ width, ...style }}>
      {label && (
        <label className="AppInput__label" htmlFor={name}>
          {label}
        </label>
      )}

      <div className="AppInput__container">
        <input
          name={name}
          type={inputType}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          className={cn('AppInput', `AppInput--${size}`)}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {variant === 'search' && (
          <span className="AppInput__icon">
            <MagnifyingGlassIcon />
          </span>
        )}

        {type === 'password' && (
          <button type="button" className="AppInput__icon" aria-label="Show password" onClick={toggleInputType}>
            {inputType === 'text' ? <EyeIcon /> : <EyeSlashIcon />}
          </button>
        )}
      </div>

      <p className="AppInput__note">{helperText}</p>
    </div>
  );
};

export default AppInput;
