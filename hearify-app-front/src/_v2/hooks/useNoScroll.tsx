import { useEffect } from 'react';

const useNoScroll = (isActive: boolean): void => {
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isActive]);
};

export default useNoScroll;
