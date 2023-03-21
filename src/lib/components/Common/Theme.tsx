import { useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { RiFontSize2 } from "react-icons/ri";
import useLocalStorage from "../../hooks/useLocalStorage";

const dark = {
  background: "#222",
  "background-transparent": "#222b",
  "background-inversed": "white",
  text: "white",
  "text-light": "darkgrey",
  "text-inversed": "black",

  primary: "#673AB7",
  "primary-dark": "#3B2667",
  "primary-light": "#c0b1dd",
  "primary-text": "#e4d8fa",
};
const light = {
  background: "white",
  "background-transparent": "#fffb",
  "background-inversed": "#1b1c1d",
  text: "black",
  "text-light": "grey",
  "text-inversed": "white",

  primary: "#673AB7",
  "primary-dark": "#3B2667",
  "primary-light": "#c0b1dd",
  "primary-text": "#3B2667",
};

const themes = [
  { name: "light", theme: light, icon: "sun" },
  { name: "dark", theme: dark, icon: "moon" },
];

export const DarkModeButton = () => {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const selected = themes.findIndex((t) => t.name === theme);

  setCSS(themes[selected]?.theme);

  //   <ThemeButton
  //   iconcolor={color}
  //   icon={themes[selected].icon}
  //   onClick={(e, d) => {
  //     const next = selected < themes.length - 1 ? selected + 1 : 0;
  //     setTheme(themes[next].name);
  //   }}
  // />

  const onClick = () => {
    const next = selected < themes.length - 1 ? selected + 1 : 0;
    setTheme(themes[next].name);
  };

  if (theme === "light") return <FaSun onClick={onClick} style={{ cursor: "pointer" }} />;
  return <FaMoon onClick={onClick} style={{ cursor: "pointer" }} />;
};

const fontsizeOptions = [
  { name: "small", size: "1.3rem", icon: "text height" },
  { name: "medium", size: "1.6rem", icon: "text height" },
  { name: "large", size: "2rem", icon: "text height" },
];

export const FontSizeButton = () => {
  const [theme, setTheme] = useLocalStorage("fontsize", "medium");
  const selected = fontsizeOptions.findIndex((t) => t.name === theme);

  document.documentElement.style.setProperty(`--font-size`, fontsizeOptions[selected].size);

  const onClick = () => {
    const next = selected < fontsizeOptions.length - 1 ? selected + 1 : 0;
    setTheme(fontsizeOptions[next].name);
  };

  return <RiFontSize2 onClick={onClick} />;
};

export const useTheme = () => {
  const [theme] = useLocalStorage("theme", "light");

  useEffect(() => {
    if (theme === "dark") setCSS(dark);
    if (theme === "light") setCSS(light);
  }, [theme]);
};

function setCSS(theme) {
  for (let property of Object.keys(theme)) {
    document.documentElement.style.setProperty(`--${property}`, theme[property]);
  }
}
