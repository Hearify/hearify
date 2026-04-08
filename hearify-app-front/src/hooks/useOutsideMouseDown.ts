import { useEffect } from 'react';

export default function useOutsideMouseDown(ref: any, callback: any | null) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      ref.current && !ref.current.contains(event.target) && callback && callback(event);
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
