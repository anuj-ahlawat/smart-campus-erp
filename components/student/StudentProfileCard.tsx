"use client";

import type { FC } from "react";

export type StudentProfile = {
  name?: string;
  email?: string;
  admissionNo?: string;
  admissionYear?: string;
  rollNo?: string;
  degree?: string;
  course?: string;
  department?: string;
  semester?: string;
  collegeName?: string;
  address?: string;
  classSection?: string;
  hostelStatus?: boolean;
  roomNumber?: string;
};

type Props = {
  profile: StudentProfile;
  title?: string;
  subtitle?: string;
};

export const StudentProfileCard: FC<Props> = ({ profile, title, subtitle }) => {
  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6 text-sm">
      {title && <h2 className="text-base font-semibold mb-1">{title}</h2>}
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Student name</p>
            <p className="font-medium">{profile.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-xs break-all">{profile.email || "-"}</p>
          </div>
          {profile.collegeName && (
            <div>
              <p className="text-xs text-muted-foreground">College</p>
              <p className="text-xs">{profile.collegeName}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Admission number</p>
              <p className="text-xs">{profile.admissionNo || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Roll no.</p>
              <p className="text-xs">{profile.rollNo || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Admission year</p>
              <p className="text-xs">{profile.admissionYear || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Semester</p>
              <p className="text-xs">{profile.semester || "-"}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Degree</p>
              <p className="text-xs">{profile.degree || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Course</p>
              <p className="text-xs">{profile.course || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="text-xs">{profile.department || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Class / Section</p>
              <p className="text-xs">{profile.classSection || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Hostel status</p>
              <p className="text-xs">{profile.hostelStatus ? "Hosteller" : "Dayscholar"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Room</p>
              <p className="text-xs">{profile.roomNumber || "-"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="text-xs whitespace-pre-wrap">{profile.address || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
