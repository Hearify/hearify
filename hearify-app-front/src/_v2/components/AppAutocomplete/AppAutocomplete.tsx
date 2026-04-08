import React, { useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import cn from 'classnames';

import AppIcon from '@v2/components/AppIcon/AppIcon';
import AppSelectDropdown from '../AppSelect/AppSelectDropdown/AppSelectDropdown';
import './AppAutocomplete.scss';

export type AppAutocompleteProps<T extends string = string> = {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  value: T;
  options: AppSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  touched?: boolean;
  error?: string;
  note?: string;
  onSelect: (value: T) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

export type AppSelectOption<T extends string = string> = {
  id: T;
  title: string;
};

function AppAutocomplete<T extends string>({
  name,
  size = 'md',
  value,
  options,
  placeholder = 'Choose value',
  disabled,
  touched,
  error,
  note,
  onSelect,
  onBlur = () => {},
}: AppAutocompleteProps<T>): React.ReactElement {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(options.find((item) => item.id === value)?.title ?? '');
  const [filteredOptions, setFilteredOptions] = useState<AppSelectOption<T>[]>(options);

  const isInputTouched: boolean = touched === undefined || touched;
  const errorMessage: string = isInputTouched && error ? error : '';
  const helperText: string = errorMessage || note || '';

  const className = cn('AppSelect__wrapper', errorMessage && 'AppSelect--error');

  const handleClick = (): void => {
    if (disabled) return;
    setIsOpened((prevState) => !prevState);
  };

  const handleFocus = (): void => {
    if (disabled || isOpened) return;
    setIsOpened(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (disabled || !isOpened) return;

    const matchedOption = options.find((option) => option.title.toLowerCase() === inputValue.toLowerCase());

    if (!matchedOption) {
      const lastValidOption = options.find((option) => option.id === value);

      setInputValue(lastValidOption?.title ?? '');
    }

    setIsOpened(false);
    onBlur(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      handleFocus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const targetValue: string = e.target.value;

    setInputValue(targetValue);
    setFilteredOptions(options.filter((option) => option.title.toLowerCase().includes(targetValue.toLowerCase())));

    if (!isOpened) setIsOpened(true);
  };

  const handleOptionSelect = (id: T) => {
    const selectedOption = options.find((option) => option.id === id);

    if (selectedOption) {
      setInputValue(selectedOption.title);
      onSelect(id);
    }
  };

  useEffect(() => {
    setFilteredOptions(options);
  }, [isOpened]);

  useEffect(() => {
    setInputValue(options.find((item) => item.id === value)?.title ?? '');
  }, [value]);

  return (
    <div className={className}>
      <div className="AppSelect__container">
        <input
          name={name}
          value={inputValue}
          disabled={disabled}
          placeholder={placeholder}
          className={cn('AppSelect', `AppSelect--${size}`, 'AppAutocomplete')}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />

        <AppIcon name="chevron-down" className={cn('AppSelect__icon', isOpened && 'AppSelect__icon--active')} />

        <CSSTransition in={isOpened} timeout={300} classNames="AppSelectDropdown" unmountOnExit>
          <AppSelectDropdown
            value={value}
            options={filteredOptions}
            onSelect={handleOptionSelect}
            onClose={handleClick}
          />
        </CSSTransition>
      </div>

      <p className="AppSelect__note">{helperText}</p>
    </div>
  );
}

export default AppAutocomplete;
