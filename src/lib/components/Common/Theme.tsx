import { useEffect } from "react";
import styled from "styled-components";
import useLocalStorage from "../../hooks/useLocalStorage";
import { StyledButton } from "../../styled/StyledSemantic";

const ThemeButton = styled(StyledButton)<{ iconcolor: string }>`
  color: ${(props) => props.iconcolor} !important;
  background: transparent !important;
  padding: 5px !important;
  font-size: inherit !important;
  margin: 0 !important;
`;

const dark = {
  background: "#1b1c1d",
  "background-inversed": "white",
  text: "white",
  "text-light": "darkgrey",
  "text-inversed": "black",
};
const light = {
  background: "white",
  "background-inversed": "#1b1c1d",
  text: "black",
  "text-light": "grey",
  "text-inversed": "white",
};

const themes = [
  { name: "light", theme: light, icon: "sun" },
  { name: "dark", theme: dark, icon: "moon" },
];

interface ThemeSelectorProps {
  color: string;
}

export const DarkModeButton = ({ color }: ThemeSelectorProps) => {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const selected = themes.findIndex((t) => t.name === theme);

  setCSS(themes[selected].theme);

  return (
    <ThemeButton
      iconcolor={color}
      icon={themes[selected].icon}
      onClick={(e, d) => {
        const next = selected < themes.length - 1 ? selected + 1 : 0;
        setTheme(themes[next].name);
      }}
    />
  );
};

const fontsizeOptions = [
  { name: "small", size: "12px", icon: "text height" },
  { name: "medium", size: "16px", icon: "text height" },
  { name: "large", size: "18px", icon: "text height" },
];

export const FontSizeButton = ({ color }: ThemeSelectorProps) => {
  const [theme, setTheme] = useLocalStorage("fontsize", "medium");
  const selected = fontsizeOptions.findIndex((t) => t.name === theme);
  console.log(selected);

  document.documentElement.style.setProperty(`--font-size`, fontsizeOptions[selected].size);

  return (
    <ThemeButton
      iconcolor={color}
      icon={fontsizeOptions[selected].icon}
      onClick={(e, d) => {
        const next = selected < fontsizeOptions.length - 1 ? selected + 1 : 0;
        setTheme(fontsizeOptions[next].name);
      }}
    />
  );
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
