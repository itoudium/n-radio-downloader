import { Box, Heading } from "@chakra-ui/react";
import { useAppContext } from "@hooks/appHook";
import { QueueItemContainer } from "./QueueItemContainer";


export const QueueContainer: React.FC = () => {
  const { queue } = useAppContext();
  return (
    <Box>
      <Heading size="sm">ダウンロード</Heading>
      {[...(queue || [])].reverse().map((item) => (
        <QueueItemContainer
          key={item.episode.id}
          item={item}
        />
      ))}
    </Box>
  );
};
