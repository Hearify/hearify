import React, { useEffect } from 'react';

import styles from '@src/components/Timer/Timer.module.scss';
import { formatSeconds } from '@src/util/formatTime';
import { useTimer } from '@src/components/Timer/TimerContext';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit.tsx';

interface TimerProps {
  brandKit: BrandKitInterface;
  setIsTimeOver: (b: boolean) => void;
}

const Timer = ({ brandKit, setIsTimeOver }: TimerProps) => {
  const { timeLeft, setTimeLeft } = useTimer();

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0) {
      setIsTimeOver(true);
      return;
    }

    const timer = setTimeout(() => {
      if (timeLeft !== null) {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, setTimeLeft, setIsTimeOver]);

  return (
    <div className={styles.timer}>
      <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15.5 0C7.229 0 0.5 6.729 0.5 15C0.5 23.271 7.229 30 15.5 30C23.771 30 30.5 23.271 30.5 15C30.5 6.729 23.771 0 15.5 0ZM15.5 27C8.8835 27 3.5 21.6165 3.5 15C3.5 8.3835 8.8835 3 15.5 3C22.1165 3 27.5 8.3835 27.5 15C27.5 21.6165 22.1165 27 15.5 27ZM23 15C23 15.8295 22.328 16.5 21.5 16.5H15.5C14.672 16.5 14 15.8295 14 15V7.5C14 6.6705 14.672 6 15.5 6C16.328 6 17 6.6705 17 7.5V13.5H21.5C22.328 13.5 23 14.1705 23 15Z"
          fill={brandKit.buttonFill}
        />
      </svg>
      <p
        className={styles.timer_text}
        style={{ color: brandKit.buttonFill, fontFamily: brandKit?.font?.family && brandKit.font.family }}
      >
        {formatSeconds(timeLeft ?? 0)}
      </p>
    </div>
  );
};

export default Timer;
