import { RepeatIcon } from "@chakra-ui/icons";
import { Box, Container, Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { useAppContext } from "@hooks/appHook";
import { useEffect, useState } from "react";
import { ConfigModal } from "./ConfigModal";

export const Header = () => {
  const { updateShowList, isLoadingShowList } = useAppContext();
  const [lock, setLock] = useState(false);

  const lockStart = () => {
    setLock(true);
    setTimeout(() => setLock(false), 5_000);
  };

  return (
    <Flex
      height="60px"
      justifyContent="space-between"
      alignItems="center"
      paddingX={3}
    >
      <Tooltip
        label="およそ30分ごとに新着エピソードを自動チェックします"
        aria-label="A tooltip"
      >
        <IconButton
          icon={<RepeatIcon />}
          aria-label={"refresh all shows and episodes"}
          onClick={() => {
            updateShowList();
            lockStart();
          }}
          isDisabled={isLoadingShowList || lock}
        />
      </Tooltip>
      <Box>
        <ConfigModal />
      </Box>
    </Flex>
  );
};
