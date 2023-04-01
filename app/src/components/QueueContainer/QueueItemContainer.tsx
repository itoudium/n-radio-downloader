import { Box, Flex, Text } from "@chakra-ui/react";
import { DownloadQueueItem } from "src/type";

type Props = {
  item: DownloadQueueItem;
}

export const QueueItemContainer = ({item}: Props) => {

  return (
    <Box>
      <Text>{item.show.name} &gt; {item.episode.title}</Text>
      <Flex>
        <Text>ダウンロード {item.finished ? 'OK' : '-'}</Text>
      </Flex>
    </Box>
  )
}