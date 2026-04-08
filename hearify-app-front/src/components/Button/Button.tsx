import React from 'react';

import Spinner from '@src/components/Loaders/Spinner';
import styles from './Button.module.scss';

type ButtonProps = {
  children: React.ReactNode;
  width?: string;
  fontSize?: string;
  disabled?: boolean;
  padding?: string;
  margin?: string;
  style?: 'purple' | 'white' | 'light' | 'transparent';
  borderColor?: string;
  bgColor?: string;
  height?: string;
  isLoading?: boolean;
  textColor?: string;
  mobileNoText?: boolean;
  className_?: string;
  Ref?: any;
  onClick?: (event?: any) => void;
};

const ButtonColor = {
  purple: {
    buttonColor: styles.purple,
  },
  white: {
    buttonColor: styles.white,
  },
  light: {
    buttonColor: styles.lightPurple,
  },
  transparent: {
    buttonColor: styles.transparent,
  },
};

function Button(props: ButtonProps) {
  return (
    <button
      style={{
        width: props.width ? props.width : '13.5rem',
        fontSize: props.fontSize ? props.fontSize : '1.5rem',
        height: props.height ? props.height : 'auto',
        color: props.textColor,
        margin: props.margin ? props.margin : 'auto',
        borderColor: props.borderColor && props.borderColor,
        backgroundColor: props.bgColor && props.bgColor,
      }}
      onClick={props.onClick}
      className={`${styles.button} ${props.className_}${props.style ? ` ${ButtonColor[props.style].buttonColor}` : ''}`}
      disabled={props.disabled}
      ref={props.Ref}
      type="submit"
    >
      <div
        className={`${styles.buttonText} ${props.mobileNoText ? styles.noText : ''}`}
        style={{ padding: props.padding ? props.padding : '1rem 1.5rem' }}
      >
        <Spinner condition={!props.isLoading}>{props.children}</Spinner>
      </div>
    </button>
  );
}

export { Button };
export default Button;
