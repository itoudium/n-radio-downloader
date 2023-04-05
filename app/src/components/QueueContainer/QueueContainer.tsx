import { Box, Divider, Heading, Stack, StackDivider } from "@chakra-ui/react";
import { useAppContext } from "@hooks/appHook";
import { useMemo } from "react";
import { QueueItemContainer } from "./QueueItemContainer";

export const QueueContainer: React.FC = () => {
  const { queue } = useAppContext();

  const downloaded = useMemo(
    () => (queue || []).filter((item) => item.finished).reverse(),
    [queue]
  );
  const downloading = useMemo(
    () => (queue || []).filter((item) => !item.finished),
    [queue]
  );

  return (
    <Box>
      <Heading size="sm" marginY={6}>ダウンロード待ち</Heading>
      <Stack divider={<StackDivider></StackDivider>}>
        {downloading.map((item, i) => (
          <QueueItemContainer key={i} item={item} />
        ))}
      </Stack>
      <Heading size="sm" marginY={6}>ダウンロード済み</Heading>
      <Stack divider={<StackDivider></StackDivider>}>
        {downloaded.map((item, i) => (
          <QueueItemContainer key={i} item={item} />
        ))}
      </Stack>
    </Box>
  );
};
