import { useEffect } from 'react';

import type React from 'react';

const useOnClickOutside = (
  ref: React.RefObject<HTMLDivElement>, //
  callback: (e: MouseEvent) => void | null
) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (!ref.current || ref.current.contains(event.target as Node)) return;

    callback(event);
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, [ref]);
};

export default useOnClickOutside;
