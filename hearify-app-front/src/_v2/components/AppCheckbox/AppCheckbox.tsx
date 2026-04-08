import React from 'react';
import cn from 'classnames';
import './AppCheckbox.scss';

export type AppCheckboxProps = {
  name?: string;
  checked: boolean;
  label?: string | React.ReactNode;
  disabled?: boolean;
  error?: string;
  note?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const AppCheckbox: React.FC<AppCheckboxProps> = ({
  name, //
  checked,
  label,
  disabled,
  error,
  note,
  onChange,
}) => {
  const helperText: string = error || note || '';

  return (
    <div className="AppCheckbox__wrapper">
      <div className="AppCheckbox">
        <input
          className={cn('AppCheckbox__input', error && `AppCheckbox__input--error`)}
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          id={name}
        />
        {label && (
          <label className="AppCheckbox__label" htmlFor={name}>
            {label}
          </label>
        )}
      </div>
      <p className={cn('AppCheckbox__note', error && 'AppCheckbox__note--error')}>{helperText}</p>
    </div>
  );
};

export default AppCheckbox;
