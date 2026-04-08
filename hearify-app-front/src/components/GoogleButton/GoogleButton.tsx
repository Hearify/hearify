import React from 'react';
import styles from './GoogleButton.module.scss';
import googleLogo from '@src/assets/images/google-logo.svg';

interface GoogleButtonProps {
  text: string;
  onClick?: () => void;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ text, onClick }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      <img src={googleLogo} />
      {text}
    </button>
  );
};
