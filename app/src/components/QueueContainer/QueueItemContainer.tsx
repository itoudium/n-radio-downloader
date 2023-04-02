import { Box, Flex, Progress, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DownloadQueueItem } from "src/type";

type Props = {
  item: DownloadQueueItem;
}

export const QueueItemContainer = ({item}: Props) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const callback = (_, data) => {
      setProgress(data * 100)
      console.log(data);
    }
    window.Main.on(`downloadProgress:${item.episode.id}`, callback);
    return () => window.Main.off(`downloadProgress:${item.episode.id}`, callback)
  }, [item.downloading])
  return (
    <Box>
      <Text fontSize="xs">{item.show.name}</Text>
      <Text>{item.episode.title}</Text>
      { item.downloading && !item.finished && <Flex alignItems="center">
        <Text>ダウンロード中</Text>
        <Progress value={progress} flexGrow={1} marginX={3} />
      </Flex>}
    </Box>
  )
}