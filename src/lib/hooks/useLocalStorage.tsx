import { useState, useCallback } from "react";
// https://blog.logrocket.com/using-localstorage-react-hooks/

function getStorageValue(key: string, defaultValue: any): any {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved);
  if (key === "guest_auth") console.log(initial, saved);
  return initial || defaultValue;
}

const useLocalStorage = (key: string, defaultValue: any): [any, (value: any) => void] => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  // This way the local storage is updated immediately, to prevent this step being skipped
  // when component unmounts first (which happened with guest_auth)
  const setLocalStorage = useCallback(
    (newvalue: any) => {
      if (typeof newvalue === "function") {
        newvalue = newvalue(value);
      }
      localStorage.setItem(key, JSON.stringify(newvalue));
      setValue(newvalue);
    },
    [key, value, setValue]
  );

  return [value, setLocalStorage];
};

export default useLocalStorage;
