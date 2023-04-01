import { RepeatIcon } from "@chakra-ui/icons";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useAppContext } from "@hooks/appHook";
import { QueueContainer } from "./QueueContainer/QueueContainer";
import { ShowListContainer } from "./ShowList/ShowListContainer";

export const FlameContainer: React.FC = () => {
  const { updateShowList } = useAppContext();

  return (
    <Flex direction="column" overflow="hidden" height="100vh">
      <Flex height="60px" justifyContent="space-between" alignItems="center">
        <Box>header</Box>
        <Box>
          <Button onClick={() => updateShowList()}>
            <RepeatIcon />
          </Button>
        </Box>
      </Flex>
      <Flex overflow="hidden" flex="1 0">
        <Box overflow="scroll" width="50%">
          <ShowListContainer />
        </Box>
        <Box overflow="scroll" width="50%">
          <QueueContainer />
        </Box>
      </Flex>
    </Flex>
  );
};
