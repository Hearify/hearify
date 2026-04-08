import styles from './Select.module.scss';

import { useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';

import searchIcon from '@src/assets/images/search.svg';
import useOutsideMouseDown from '@src/hooks/useOutsideMouseDown';

type SelectProperties = {
  options: Array<any>;
  onSelect: any;
  selected: any;
  label?: string;
  purple?: boolean;
  fontSize?: string;
  textStyle?: Object;
  disabled?: boolean;
  searchable?: boolean;
  caseSensitive?: boolean;
  width?: Object;
  _className?: string;
  containerClassName?: string;
  onDisabledClick?: () => void;
};

const Select = ({
  options = [],
  onSelect = null,
  selected = null,
  label = 'Select an option',
  purple = false,
  disabled = false,
  fontSize = '20px',
  width = {},
  searchable,
  caseSensitive,
  _className,
  containerClassName,
  onDisabledClick = () => {},
}: SelectProperties) => {
  const containerRef = useRef<any>();

  const [expanded, setExpanded] = useState<any>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<any>(selected);

  useEffect(() => {
    setSelectedOption(selected);
  }, [selected]);

  const getLabel = () => (selectedOption?.length ? selectedOption : label);

  const selectOption = (option: any, index: any) => {
    setSelectedOption(option);

    const callback = option.onSelect ?? onSelect;

    callback && callback(option, index, options);
    setExpanded(false);
  };

  useOutsideMouseDown(containerRef, () => setExpanded(false));

  const handleClick = () => {
    if (disabled) {
      onDisabledClick();
    } else {
      setExpanded(true);
    }
  };

  const filterOption = (option: any, search: string) => {
    try {
      if (!caseSensitive) {
        option = option.toLowerCase();
      }

      return option.includes(search);
    } catch {
      return false;
    }
  };

  const filteredOptions = () => {
    if (!searchable) {
      return options;
    }

    const _search = caseSensitive ? search : search.toLowerCase();

    return options.filter((option) => filterOption(option, _search));
  };

  return (
    <div className={`${styles.custom_select} ${containerClassName || ''}`} ref={containerRef}>
      <div
        onClick={handleClick}
        className={`${styles.selector} ${purple ? styles.purple : styles.grey} ${disabled ? styles.disabled : ''} ${_className || ''}`}
        style={width}
      >
        <div className={styles.label} style={{ fontSize: `${fontSize}` }}>
          {getLabel()}
        </div>
        <Icon path={mdiChevronDown} className={styles.icon} size={1} />
      </div>

      {expanded && !disabled && (
        <div className={styles.custom_selector}>
          <div onClick={() => setExpanded(false)} className={styles.label}>
            <span>{getLabel()}</span>
            <Icon path={mdiChevronUp} size={1} />
          </div>

          {searchable && (
            <div className={styles.search_bar}>
              <img src={searchIcon} alt="" />
              <input
                type="text"
                value={search}
                onChange={({ target: { value } }) => setSearch(value)}
                placeholder="Search"
              />
            </div>
          )}

          <div className={styles.elements}>
            {filteredOptions().map((option, index) => {
              if (option !== selectedOption) {
                return (
                  <div key={index} className={styles.element} onClick={() => selectOption(option, index)}>
                    {option}
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
