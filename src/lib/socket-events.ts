export const SOCKET_EVENTS = {
  ATTENDANCE_MARKED: "attendanceMarked",
  OUTPASS_STATUS_CHANGED: "outpassStatusChanged",
  NEW_ANNOUNCEMENT: "newAnnouncement",
  MENU_PUBLISHED: "menuPublished"
} as const;

export type SocketEventKeys = keyof typeof SOCKET_EVENTS;

