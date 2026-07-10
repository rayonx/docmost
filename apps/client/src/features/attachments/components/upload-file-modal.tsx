import { useState } from "react";
import {
  Button,
  Divider,
  FileButton,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { SpaceSelect } from "@/features/space/components/sidebar/space-select";
import { ISpace } from "@/features/space/types/space.types";
import { useUploadFileMutation } from "@/features/attachments/queries/attachment-query.ts";

export default function UploadFileModal() {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const [space, setSpace] = useState<ISpace | null>(null);
  const uploadFileMutation = useUploadFileMutation();

  const handleClose = () => {
    setSpace(null);
    close();
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file || !space) return;
    await uploadFileMutation.mutateAsync({ file, spaceId: space.id });
    handleClose();
  };

  return (
    <>
      <Button onClick={open}>{t("Upload file")}</Button>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={t("Upload file")}
        closeButtonProps={{ "aria-label": t("Close") }}
      >
        <Divider size="xs" mb="md" />

        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {t("Choose a space to upload the file to.")}
          </Text>

          <SpaceSelect onChange={setSpace} value={space?.slug} />

          <Group justify="flex-end" mt="xs">
            <FileButton onChange={handleFileSelect} disabled={!space}>
              {(props) => (
                <Button
                  {...props}
                  loading={uploadFileMutation.isPending}
                  disabled={!space}
                >
                  {t("Choose file")}
                </Button>
              )}
            </FileButton>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
