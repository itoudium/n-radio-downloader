import {
  Box,
  Flex,
  Heading,
  Spinner,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { useAppContext } from "../../hooks/appHook";
import { ShowDetail } from "./ShowDetail";

export const ShowListContainer: React.FC = () => {
  const { showList, isLoadingShowList } = useAppContext();
  if (isLoadingShowList) {
    return (
      <Flex justifyContent="center">
        <Spinner />
      </Flex>
    );
  }
  return (
    <Box>
      <Heading size="sm">番組</Heading>

      <Stack divider={<StackDivider></StackDivider>}>
        {showList.map((show, i) => (
          <ShowDetail key={i} show={show} />
        ))}
      </Stack>
    </Box>
  );
};
