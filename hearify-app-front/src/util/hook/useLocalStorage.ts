import { useState } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void, (value: T) => void] {
  function saveToLocalStorage(value: T) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function readToLocalStorage(): T {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  }

  function removeValue() {
    window.localStorage.removeItem(key);
  }

  const [storedValue, setStoredValue] = useState(readToLocalStorage());

  const setValue = (value: T) => {
    saveToLocalStorage(value);
    setStoredValue(value);
  };

  const updateValue = (value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue, removeValue, updateValue];
}

export default useLocalStorage;
