import { Box, Button, Checkbox, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { useAppContext } from "@hooks/appHook";
import { Show } from "@n-radio-downloader/downloader/dist/lib/types";
import { useEffect, useMemo, useState } from "react";

type Props = {
  show: Show;
};

export const ShowDetail = ({ show }: Props) => {
  const { downloadTarget, updateDownloadTarget } = useAppContext();

  const selected = useMemo(
    () => (downloadTarget ?? {})[show.id],
    [downloadTarget]
  );

  const checkChanged = (checked: boolean) => {
    updateDownloadTarget(show.id, checked);
  };

  // receive isChecking status from main process
  const [isChecking, setIsChecking] = useState(false);
  useEffect(() => {
    const callback = (_, isChecking: boolean) => {
      setIsChecking(isChecking);
    };
    window.Main.on(`episodeChecking:${show.id}`, callback);
    return () => window.Main.off(`episodeChecking:${show.id}`, callback);
  }, [show.id]);

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center">
        <Box flexGrow={1}>
          <Text fontSize="xs">{show.genre}</Text>
          <Text>{show.name}</Text>
        </Box>
        <Box>
          {selected ? (
            <Button onClick={() => checkChanged(false)}>解除</Button>
          ) : (
            <Button onClick={() => checkChanged(true)}>選択</Button>
          )}
        </Box>
        <Box flexBasis={10}>
          {isChecking && (
            <Spinner size="xs" />
          )}
        </Box>
      </Flex>
    </Box>
  );
};
