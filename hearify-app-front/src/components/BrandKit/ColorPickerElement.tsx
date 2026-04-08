import { HexColorPicker } from 'react-colorful';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@src/components/BrandKit/BrandKit.module.scss';
import { setClipboardText } from '@src/util/clipboard.ts';
import { successToast } from '@src/toasts/toasts.tsx';

interface ColorPickerElementProps {
  text?: string;
  color: string;
  setColor: (color: string) => void;
}

const ColorPickerElement = (props: ColorPickerElementProps) => {
  const { t } = useTranslation('general');
  const ref = useRef(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [hexInput, setHexInput] = useState(props.color);
  const [isValidHex, setIsValidHex] = useState(true);

  useEffect(() => {
    if (isHexColor(hexInput)) {
      props.setColor(hexInput);
      setIsValidHex(true);
    } else {
      setIsValidHex(false);
    }
  }, [hexInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // @ts-ignore
      if (ref.current && !ref.current.contains(event.target as HTMLDivElement)) {
        setIsColorPickerOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [setIsColorPickerOpen]);

  const handleColorPickerClick = () => {
    setIsColorPickerOpen(true);
  };

  const isHexColor = (str: string): boolean => {
    const hexColorRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
    return hexColorRegex.test(str);
  };

  const handleCopyHexClick = () => {
    setClipboardText(props.color);
    successToast(`${t('color_copied')}!`);
  };

  return (
    <div className={styles.colorPickerContainer}>
      {props.text && <span className={styles.optionText}>{props.text}</span>}
      <div className={styles.colorPickerOuter} onClick={handleColorPickerClick}>
        <div className={styles.colorPickerInner} style={{ backgroundColor: props.color }} />
        {isColorPickerOpen && (
          <div ref={ref} className={styles.hexColorPickerContainer}>
            <HexColorPicker className={styles.colorPicker} color={props.color} onChange={props.setColor} />
            <div className={styles.hexInputGroup}>
              <input
                value={props.color}
                onChange={(event: any) => {
                  setHexInput(event.target.value);
                }}
                style={{ borderColor: isValidHex ? '#E0E0E0' : 'red' }}
                className={styles.hexInput}
              />
              <button className={styles.copyHex} onClick={handleCopyHexClick}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.copyIcon}
                >
                  <path
                    d="M27.5 13.75V10C27.5 7.92893 25.8211 6.25 23.75 6.25H10C7.92893 6.25 6.25 7.92893 6.25 10V23.75C6.25 25.8211 7.92893 27.5 10 27.5H13.75M27.5 13.75H30C32.0711 13.75 33.75 15.4289 33.75 17.5V30C33.75 32.0711 32.0711 33.75 30 33.75H17.5C15.4289 33.75 13.75 32.0711 13.75 30V27.5M27.5 13.75H17.5C15.4289 13.75 13.75 15.4289 13.75 17.5V27.5"
                    stroke="#6A6666"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPickerElement;
