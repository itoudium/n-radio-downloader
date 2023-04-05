import { createRoot } from "react-dom/client";
import {
  ChakraProvider,
  ColorModeScript,
  extendTheme,
  ThemeConfig,
} from "@chakra-ui/react";
import { FlameContainer } from "./components/FlameContainer";
import { AppProvider } from "@hooks/appHook";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const App = () => {
  return (
    <AppProvider>
      <ChakraProvider theme={theme}>
        <FlameContainer />
      </ChakraProvider>
    </AppProvider>
  );
};

createRoot(document.getElementById("app")).render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </>
);
