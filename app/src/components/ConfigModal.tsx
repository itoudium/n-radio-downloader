import {
  Button,
  Flex,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { useAppContext } from "@hooks/appHook";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const ConfigModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { downloadDir } = useAppContext();
  const { register, handleSubmit, setValue, formState, trigger, reset } = useForm({
    defaultValues: {
      downloadDirTemp: downloadDir,
    },
  });
  const errors = formState.errors;
  const isValid = formState.isValid;

  useEffect(() => setValue("downloadDirTemp", downloadDir), [downloadDir]);

  const openDirectory = async () => {
    const result = await window.Main.openDirectory();
    if (result) {
      setValue("downloadDirTemp", result);
      trigger();
    }
  };

  const onSubmit = (data) => {
    window.Main.send("applyConfig", {
      downloadDirectory: data.downloadDirTemp,
    });
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen}>設定</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>設定</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Heading size="sm">ダウンロード先ディレクトリ</Heading>
              <Flex marginY={2}>
                <Input
                  flexGrow={1}
                  type="text"
                  {...register("downloadDirTemp", {
                    required: true,
                  })}
                />
                <Button onClick={openDirectory}>選択</Button>
              </Flex>
              {errors.downloadDirTemp && (
                <Text color="red.500">
                  ダウンロード先ディレクトリを指定してください
                </Text>
              )}
            </ModalBody>

            <ModalFooter>
              <Button type="submit" colorScheme="blue" isDisabled={!isValid}>
                保存して閉じる
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
