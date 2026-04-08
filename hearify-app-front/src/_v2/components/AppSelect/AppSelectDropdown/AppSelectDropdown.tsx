import React, { useState, useEffect } from 'react';

import AppSelectItem from '../AppSelectItem/AppSelectItem';
import './AppSelectDropdown.scss';

import type { AppSelectOption } from '../AppSelect';

export type AppSelectDropdownProps<T extends string = string> = {
  value: T;
  options: AppSelectOption<T>[];
  onSelect: (value: T) => void;
  onClose: () => void;
};

function AppSelectDropdown<T extends string>({
  value,
  options,
  onSelect,
  onClose,
}: AppSelectDropdownProps<T>): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleClick = (id: T): void => {
    if (id === value) return;
    onSelect(id);
    onClose();
  };

  const handleKeyPress = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown') {
      const nextIndex = activeIndex !== null ? activeIndex + 1 : 0;
      setActiveIndex(nextIndex < options.length ? nextIndex : 0);
    } else if (e.key === 'ArrowUp') {
      const nextIndex = activeIndex !== null ? activeIndex - 1 : options.length - 1;
      setActiveIndex(nextIndex < 0 ? options.length - 1 : nextIndex);
    } else if (e.key === 'Enter') {
      if (activeIndex === null || !options[activeIndex]) return;
      handleClick(options[activeIndex].id);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeIndex]);

  return (
    <div className="AppSelectDropdown">
      {options.map((item, index) => (
        <AppSelectItem
          key={item.id}
          item={item}
          selected={item.id === value}
          active={index === activeIndex}
          onClick={handleClick}
        />
      ))}

      {options.length === 0 && <AppSelectItem item={{ id: '', title: 'No options found' }} readonly />}
    </div>
  );
}

export default AppSelectDropdown;
