import { Box, Button, Checkbox, Flex, Heading, Text } from "@chakra-ui/react";
import { useAppContext } from "@hooks/appHook";
import { Show } from "@n-radio-downloader/downloader/dist/lib/types";
import { useMemo } from "react";

type Props = {
  show: Show;
};

export const ShowDetail = ({ show }: Props) => {
  const { downloadTarget, updateDownloadTarget } = useAppContext();

  const selected = useMemo(() => (downloadTarget ?? {})[show.id], [downloadTarget]);

  const checkChanged = (checked: boolean) => {
    updateDownloadTarget(show.id, checked);
  };

  return (
    <Box>
      <Flex>
        <Box>
          <Text>{show.name}</Text>
          <Text>{show.genre}</Text>
        </Box>
        <Box>
          {
            selected ? 
            (
              <Button onClick={() => checkChanged(false)}>unselect</Button>
            ):
            (
              <Button onClick={() => checkChanged(true)}>select</Button>
            )
          }
        </Box>
      </Flex>
    </Box>
  );
};
