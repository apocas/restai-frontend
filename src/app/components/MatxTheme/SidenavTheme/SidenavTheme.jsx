import { ThemeProvider, useTheme } from "@mui/material";
import useSettings from "app/hooks/useSettings";

export default function SidenavTheme({ children }) {
  const theme = useTheme();
  const { settings } = useSettings();
  const sidenavTheme = settings.themes[settings.layout1Settings.leftSidebar.theme] || theme;

  return <ThemeProvider theme={sidenavTheme}>{children}</ThemeProvider>;
}
