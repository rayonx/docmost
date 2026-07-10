import { Container, Title, Text, Group, Box } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { getAppName } from "@/lib/config";
import { useGetWorkspaceAttachmentsQuery } from "@/features/attachments/queries/attachment-query";
import AllAttachmentsList from "@/features/attachments/components/all-attachments-list";
import UploadFileModal from "@/features/attachments/components/upload-file-modal";
import { usePaginateAndSearch } from "@/hooks/use-paginate-and-search";

export default function Files() {
  const { t } = useTranslation();
  const { search, cursor, goNext, goPrev, handleSearch } = usePaginateAndSearch();

  const { data } = useGetWorkspaceAttachmentsQuery({
    cursor,
    limit: 30,
    query: search,
  });

  return (
    <>
      <Helmet>
        <title>
          {t("Files")} - {getAppName()}
        </title>
      </Helmet>

      <Container size={"800"} pt="xl">
        <Group justify="space-between" mb="xl">
          <Title order={1} size="h3">{t("Files")}</Title>
          <UploadFileModal />
        </Group>

        <Box>
          <Text size="sm" c="dimmed" mb="md">
            {t("All files")}
          </Text>

          <AllAttachmentsList
            attachments={data?.items || []}
            onSearch={handleSearch}
            hasPrevPage={data?.meta?.hasPrevPage}
            hasNextPage={data?.meta?.hasNextPage}
            onNext={() => goNext(data?.meta?.nextCursor)}
            onPrev={goPrev}
          />
        </Box>
      </Container>
    </>
  );
}
