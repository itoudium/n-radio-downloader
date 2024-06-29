import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Heading,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useAppContext } from "@hooks/appHook";
import { Show } from "@n-radio-downloader/downloader/dist/lib/types";
import { useEffect, useState } from "react";

type Props = {
  show: Show;
};

export const ShowDetail = ({ show }: Props) => {
  const { downloadTarget, updateDownloadTarget } = useAppContext();

  const selected = (downloadTarget ?? {})[show.id];

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

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <Box flexGrow={1}>
          <Text fontSize="xs" color="gray.500">{show.genre}</Text>
          
          {show.corderName ? (
            <>
              <Text fontSize="xs" color="gray.500">{show.name}</Text>
              <Text>{show.corderName}</Text>
            </>
          ) : (
            <Text>{show.name}</Text>
          )}
          <Link href={show.siteUrl} display="flex" alignItems="center">
            <ExternalLinkIcon marginRight={1} />
            web
          </Link>
        </Box>
        <Box>
          {selected ? (
            <Button
              w={150}
              onClick={() => checkChanged(false)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isHovered ? <Text>解除</Text> : <Text>フォロー中</Text>}
            </Button>
          ) : (
            <Button
              w={150}
              onClick={() => checkChanged(true)}
              colorScheme="blue"
            >
              +フォロー
            </Button>
          )}
        </Box>
        <Box flexBasis={10}>{isChecking && <Spinner size="xs" />}</Box>
      </Flex>
    </Container>
  );
};
