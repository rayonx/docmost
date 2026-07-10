import {
  Table,
  Text,
  Group,
  Box,
  Space,
  VisuallyHidden,
  Anchor,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useTranslation } from "react-i18next";
import { formatBytes } from "@/lib";
import { timeAgo } from "@/lib/time";
import { getFileUrl } from "@/lib/config.ts";
import { SearchInput } from "@/components/common/search-input";
import Paginate from "@/components/common/paginate";
import NoTableResults from "@/components/common/no-table-results";
import { CustomAvatar } from "@/components/ui/custom-avatar.tsx";
import { AutoTooltipText } from "@/components/ui/auto-tooltip-text.tsx";
import { IWorkspaceAttachment } from "@/features/attachments/types/attachment.types.ts";
import { useDeleteAttachmentMutation } from "@/features/attachments/queries/attachment-query.ts";

function getAttachmentUrl(attachment: IWorkspaceAttachment) {
  return getFileUrl(
    `/files/${attachment.id}/${encodeURIComponent(attachment.fileName)}`,
  );
}

interface AllAttachmentsListProps {
  attachments: IWorkspaceAttachment[];
  onSearch: (query: string) => void;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export default function AllAttachmentsList({
  attachments,
  onSearch,
  hasPrevPage,
  hasNextPage,
  onNext,
  onPrev,
}: AllAttachmentsListProps) {
  const { t } = useTranslation();
  const deleteAttachmentMutation = useDeleteAttachmentMutation();

  const openDeleteModal = (attachment: IWorkspaceAttachment) =>
    modals.openConfirmModal({
      title: t("Delete file"),
      centered: true,
      children: (
        <Text size="sm">
          {t('Are you sure you want to delete "{{fileName}}"? This action cannot be undone.', {
            fileName: attachment.fileName,
          })}
        </Text>
      ),
      labels: { confirm: t("Delete"), cancel: t("Cancel") },
      confirmProps: { color: "red" },
      onConfirm: () => deleteAttachmentMutation.mutate(attachment.id),
    });

  return (
    <Box>
      <SearchInput onSearch={onSearch} />

      <Space h="md" />

      <Table.ScrollContainer minWidth={700}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Caption>
            <VisuallyHidden>
              {t("List of files in this workspace")}
            </VisuallyHidden>
          </Table.Caption>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("File")}</Table.Th>
              <Table.Th>{t("Type")}</Table.Th>
              <Table.Th>{t("Size")}</Table.Th>
              <Table.Th>{t("Uploaded by")}</Table.Th>
              <Table.Th>{t("Created")}</Table.Th>
              <Table.Th>{t("Updated")}</Table.Th>
              <Table.Th w={60}>
                <VisuallyHidden>{t("Action")}</VisuallyHidden>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {attachments.length > 0 ? (
              attachments.map((attachment) => (
                <Table.Tr key={attachment.id}>
                  <Table.Td>
                    <Anchor
                      href={getAttachmentUrl(attachment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      size="sm"
                      fw={500}
                      style={{
                        display: "block",
                        minWidth: 0,
                        maxWidth: 350,
                        color: "var(--mantine-color-text)",
                      }}
                    >
                      <AutoTooltipText fz="sm" fw={500} lineClamp={1}>
                        {attachment.fileName}
                      </AutoTooltipText>
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                      {attachment.fileExt?.replace(/^\./, "").toUpperCase()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                      {formatBytes(attachment.fileSize)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {attachment.creatorName ? (
                      <Group gap="xs" wrap="nowrap">
                        <CustomAvatar
                          name={attachment.creatorName}
                          avatarUrl={attachment.creatorAvatarUrl}
                          size="sm"
                        />
                        <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                          {attachment.creatorName}
                        </Text>
                      </Group>
                    ) : (
                      <Text size="sm" c="dimmed">
                        {t("Unknown")}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                      {timeAgo(new Date(attachment.createdAt))}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                      {timeAgo(new Date(attachment.updatedAt))}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={t("Delete file")} openDelay={250} withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label={t("Delete file")}
                        onClick={() => openDeleteModal(attachment)}
                        loading={
                          deleteAttachmentMutation.isPending &&
                          deleteAttachmentMutation.variables === attachment.id
                        }
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <NoTableResults colSpan={7} />
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {attachments.length > 0 && (
        <Paginate
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          onNext={onNext}
          onPrev={onPrev}
        />
      )}
    </Box>
  );
}
