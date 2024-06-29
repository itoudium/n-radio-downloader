import {
  Box,
  Card,
  CardBody,
  Checkbox,
  Flex,
  Heading,
  Select,
  Spinner,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAppContext } from "../../hooks/appHook";
import { ShowDetail } from "./ShowDetail";

export const ShowListContainer: React.FC = () => {
  const {
    showList,
    isLoadingShowList,
    downloadTarget,
    isFilteredDownloadTarget,
    selectedGenre,
    setIsFilteredDownloadTarget,
    setSelectedGenre,
  } = useAppContext();

  const genreList = new Set<string>(showList?.flatMap((show) => show.genre.split(",")) ?? []);

  const filteredShowList = (showList || []).filter((show) => {
    return (
      (!isFilteredDownloadTarget || (downloadTarget ?? {})[show.id]) &&
      (!selectedGenre || show.genre.split(",").findIndex((genre) => genre === selectedGenre) !== -1)
    );
  });

  if (isLoadingShowList) {
    return (
      <Stack justifyContent="center" alignItems="center">
        <Box marginTop={32}>
          <Text>番組情報を取得中...</Text>
        </Box>
        <Spinner />
      </Stack>
    );
  }
  return (
    <Box>
      <Card
        position="fixed"
        bg="Body"
        width="calc(50vw - 32px)"
        marginX="16px"
        zIndex={1}
      >
        <CardBody>
          <Heading size="sm">番組</Heading>
          <Flex marginTop={2} justifyContent="space-between" gap={2}>
            <Select
              flex="1 0 50%"
              placeholder="ジャンルを選択"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {Array.from(genreList).map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </Select>

            <Checkbox
              flex="1 0 50%"
              isChecked={isFilteredDownloadTarget}
              onChange={(e) => setIsFilteredDownloadTarget(e.target.checked)}
            >
              フォロー中のみ表示
            </Checkbox>
          </Flex>
        </CardBody>
      </Card>

      <Stack divider={<StackDivider></StackDivider>} paddingTop={32}>
        {filteredShowList.map((show) => (
          <ShowDetail key={show.id} show={show} />
        ))}
      </Stack>
    </Box>
  );
};
