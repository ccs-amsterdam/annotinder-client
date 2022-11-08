import { useState, useCallback } from "react";
// https://blog.logrocket.com/using-sessionstorage-react-hooks/

function getStorageValue(key: string, defaultValue: any): any {
  // getting stored value
  const saved = sessionStorage.getItem(key);
  const initial = JSON.parse(saved);
  return initial ?? defaultValue;
}

const useSessionStorage = (key: string, defaultValue: any): [any, (value: any) => void] => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  // This way the session storage is updated immediately, to prevent this step being skipped
  const setSessionStorage = useCallback(
    (newvalue: any) => {
      if (typeof newvalue === "function") {
        newvalue = newvalue(value);
      }
      sessionStorage.setItem(key, JSON.stringify(newvalue));
      setValue(newvalue);
    },
    [key, value, setValue]
  );

  return [value, setSessionStorage];
};

export default useSessionStorage;
