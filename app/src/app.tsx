import * as ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { FlameContainer } from "./components/FlameContainer";
import { AppProvider } from "@hooks/appHook";

function render() {
  ReactDOM.render(
    <AppProvider>
      <ChakraProvider>
        <FlameContainer />
      </ChakraProvider>
    </AppProvider>,
    document.body
  );
}

render();
