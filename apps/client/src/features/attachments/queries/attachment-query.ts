import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  deleteAttachment,
  getWorkspaceAttachments,
  uploadFileToSpace,
} from "@/features/attachments/services/attachment-service.ts";
import { IWorkspaceAttachment } from "@/features/attachments/types/attachment.types.ts";
import { IPagination, QueryParams } from "@/lib/types.ts";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

export function useGetWorkspaceAttachmentsQuery(
  params?: QueryParams,
): UseQueryResult<IPagination<IWorkspaceAttachment>, Error> {
  return useQuery({
    queryKey: ["workspace-attachments", params],
    queryFn: () => getWorkspaceAttachments(params),
    placeholderData: keepPreviousData,
    refetchOnMount: true,
  });
}

export function useUploadFileMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<
    IWorkspaceAttachment,
    Error,
    { file: File; spaceId: string }
  >({
    mutationFn: ({ file, spaceId }) => uploadFileToSpace(file, spaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-attachments"] });
    },
    onError: (error) => {
      const errorMessage =
        error["response"]?.data?.message ?? t("Failed to upload file");
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useDeleteAttachmentMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<void, Error, string>({
    mutationFn: (attachmentId) => deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-attachments"] });
    },
    onError: (error) => {
      const errorMessage =
        error["response"]?.data?.message ?? t("Failed to delete file");
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}
