"use client";

import { RoleLayout } from "@/components/layout/RoleLayout";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { StudentProfileCard } from "@/components/student/StudentProfileCard";

export default function StudentDashboardPage() {
  const { role, isLoaded } = useRoleGuard("student");
  const { user, status } = useAuth();

  if (!isLoaded || !role || status === "loading") {
    return <div className="p-8 text-center">Preparing dashboard…</div>;
  }

  const profile = {
    name: user?.name,
    email: user?.email,
    admissionNo: user?.admissionNo,
    admissionYear: user?.admissionYear,
    rollNo: user?.rollNo,
    degree: user?.degree,
    course: user?.course,
    department: user?.department,
    semester: user?.semester,
    collegeName: user?.collegeName,
    address: user?.address,
    classSection: user?.classSection,
    hostelStatus: user?.hostelStatus,
    roomNumber: user?.roomNumber
  };

  return (
    <RoleLayout
      role="student"
      title="Student Dashboard"
      subtitle="Your campus control center"
    >
      <StudentProfileCard
        profile={profile}
        title="Student profile"
        subtitle="Core academic and hostel details pulled from your college records."
      />
    </RoleLayout>
  );
}