export type UserRole =
  | "admin"
  | "student"
  | "teacher"
  | "parent"
  | "warden"
  | "staff"
  | "cafeteria"
  | "security";

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  parent: "/parent/dashboard",
  warden: "/warden/dashboard",
  staff: "/staff/dashboard",
  cafeteria: "/cafeteria/dashboard",
  security: "/security/scan"
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  student: "Student",
  teacher: "Teacher",
  parent: "Parent",
  warden: "Warden",
  staff: "Staff",
  cafeteria: "Cafeteria",
  security: "Security"
};

export const ROLE_ROUTE_PREFIX: Record<UserRole, string[]> = {
  admin: ["/admin"],
  student: ["/student"],
  teacher: ["/teacher"],
  parent: ["/parent"],
  warden: ["/warden"],
  staff: ["/staff"],
  cafeteria: ["/cafeteria"],
  security: ["/security"]
};

export const ROLE_NAV_LINKS: Record<
  UserRole,
  { label: string; href: string }[]
> = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Students", href: "/admin/student-list" },
    { label: "Events", href: "/admin/events" },
    { label: "Results", href: "/admin/results" },
    { label: "Fees", href: "/admin/fees" },
    { label: "Courses", href: "/admin/courses" },
    { label: "Timetable", href: "/admin/timetable" }
  ],
  student: [
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "Attendance", href: "/student/attendance" },
    { label: "Outpass", href: "/student/outpass" },
    { label: "Results", href: "/student/results" },
    { label: "Events", href: "/student/events" },
    { label: "Timetable", href: "/student/timetable" },
    { label: "Cafeteria", href: "/student/cafeteria" }
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher/dashboard" },
    { label: "Attendance", href: "/teacher/attendance" },
    { label: "Timetable", href: "/teacher/timetable" },
    { label: "Events", href: "/teacher/events" },
    { label: "Results", href: "/teacher/results" }
  ],
  parent: [
    { label: "Dashboard", href: "/parent/dashboard" },
    { label: "Attendance", href: "/parent/attendance" },
    { label: "Results", href: "/parent/results" },
    { label: "Events", href: "/parent/events" },
    { label: "Fees", href: "/parent/fees" },
    { label: "Outpass", href: "/parent/outpass" }
  ],
  warden: [
    { label: "Dashboard", href: "/warden/dashboard" },
    { label: "Outpass Queue", href: "/warden/outpass" },
    { label: "Hostel Roster", href: "/warden/students" }
  ],
  staff: [{ label: "Dashboard", href: "/staff/dashboard" }],
  cafeteria: [
    { label: "Dashboard", href: "/cafeteria/dashboard" },
    { label: "Menu", href: "/cafeteria/menu" },
    { label: "Scan", href: "/cafeteria/scan" }
  ],
  security: [{ label: "Gate Scanner", href: "/security/scan" }]
};

