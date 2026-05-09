import { ApiCardStatus } from "@/types/api/card";
import { DisplayStatus } from "@/types";

const STATUS_DISPLAY: Record<ApiCardStatus, DisplayStatus> = {
  new: "未学",
  again: "不会",
  learning: "模糊",
  mastered: "掌握",
};

export function getDisplayStatus(card: { status: ApiCardStatus }): DisplayStatus {
  return STATUS_DISPLAY[card.status] ?? "未学";
}

export function getStatusColor(status: DisplayStatus): string {
  if (status === "掌握") return "#34C759";
  if (status === "模糊") return "#FF9500";
  if (status === "不会") return "#FF3B30";
  return "#C7C7CC";
}
