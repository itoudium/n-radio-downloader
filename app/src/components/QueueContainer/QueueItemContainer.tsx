import {
  Box,
  CloseButton,
  Flex,
  IconButton,
  Progress,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DownloadQueueItem } from "src/type";

type Props = {
  item: DownloadQueueItem;
};

export const QueueItemContainer = ({ item }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const callback = (_, data) => {
      setProgress(data * 100);
      console.log(data);
    };
    window.Main.on(`downloadProgress:${item.episode.id}`, callback);
    return () =>
      window.Main.off(`downloadProgress:${item.episode.id}`, callback);
  }, [item.downloading]);

  // cancel and remove from queue
  const onClickRemove = () => {
    window.Main.send("downloadCancel", item.episode.id);
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center">
        <Box flexGrow={1}>
          <Text fontSize="xs">{item.show.name}</Text>
          <Text>{item.episode.title}</Text>
          <Text>{item.episode.onAirDate}</Text>
          {item.downloading && !item.finished && (
            // downloading progress
            <Flex alignItems="center">
              <Text>ダウンロード中</Text>
              <Progress value={progress} flexGrow={1} marginX={3} />
            </Flex>
          )}
        </Box>
        <Box>
          {
            // remove from queue
            !item.finished && <CloseButton size="sm" onClick={onClickRemove} />
          }
        </Box>
      </Flex>
    </Box>
  );
};
