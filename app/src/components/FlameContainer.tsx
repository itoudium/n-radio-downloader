import { Box, Flex } from "@chakra-ui/react";
import { Header } from "./Header";
import { QueueContainer } from "./QueueContainer/QueueContainer";
import { ShowListContainer } from "./ShowList/ShowListContainer";

export const FlameContainer: React.FC = () => {
  return (
    <Flex direction="column" overflow="hidden" height="100vh">
      <Header />
      <Flex overflow="hidden" flex="1 0">
        <Box overflowY="scroll" width="50%">
          <ShowListContainer />
        </Box>
        <Box overflowY="scroll" width="50%">
          <QueueContainer />
        </Box>
      </Flex>
    </Flex>
  );
};
