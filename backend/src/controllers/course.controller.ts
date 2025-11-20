import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthRequest } from "../middleware/auth";
import { CourseModel } from "../models";

const DEFAULT_COURSES = [
  // Semester 1
  { code: "CSET108", title: "Environment and Sustainability", credits: 3, semester: 1 },
  { code: "EMAT101L", title: "Engineering Calculus", credits: 4, semester: 1 },
  { code: "CSET101", title: "Computational Thinking and Programming", credits: 5, semester: 1 },
  { code: "EPHY111L", title: "ELECTROMAGNETISM AND MECHANICS", credits: 5, semester: 1 },
  // Semester 2
  { code: "ICIE111J", title: "The Start-up Sprint", credits: 1, semester: 2 },
  { code: "CSET103", title: "New Age Life Skills", credits: 2, semester: 2 },
  { code: "CSET102", title: "Introduction to Electrical and Electronics Engineering", credits: 4, semester: 2 },
  { code: "CSET105", title: "Digital Design", credits: 4, semester: 2 },
  { code: "CSET106", title: "Discrete Mathematical Structures", credits: 4, semester: 2 },
  { code: "EMAT102L", title: "Linear Algebra and Ordinary Differential Equations", credits: 4, semester: 2 },
  { code: "CSET109", title: "Object Oriented Programming using Java", credits: 6, semester: 2 },
  // Semester 3
  { code: "CSET201", title: "Information Management Systems", credits: 4, semester: 3 },
  { code: "CSET213", title: "Linux and Shell Programming", credits: 4, semester: 3 },
  { code: "CSET240", title: "Probability and Statistics", credits: 5, semester: 3 },
  { code: "CSET243", title: "Data Structure using C++", credits: 7, semester: 3 },
  { code: "CSET205", title: "Software Engineering", credits: 4, semester: 3 },
  // Semester 4
  { code: "CSET203", title: "Microprocessors and Computer Architecture", credits: 4, semester: 4 },
  { code: "CSET207", title: "Computer Networks", credits: 4, semester: 4 },
  { code: "CSET208", title: "Ethics for Engineers, Patents, Copyrights and IPR", credits: 1, semester: 4 },
  { code: "CSET209", title: "Operating Systems", credits: 4, semester: 4 },
  { code: "CSET227", title: "System and Network Security", credits: 4, semester: 4 },
  { code: "CSET244", title: "Design and Analysis of Algorithms", credits: 7, semester: 4 },
  { code: "CSET210", title: "Design Thinking & Innovation", credits: 2, semester: 4 },
  // Semester 5
  { code: "CSET481", title: "Software Testing", credits: 3, semester: 5 },
  { code: "CSET382", title: "Web Technologies", credits: 3, semester: 5 },
  { code: "CSET381", title: "Applications of AI", credits: 3, semester: 5 },
  {
    code: "CSET363",
    title: "Penetration Testing, Auditing and Ethical Hacking",
    credits: 3,
    semester: 5
  },
  { code: "CSET326", title: "Soft Computing", credits: 3, semester: 5 },
  { code: "CSET324", title: "Software Project Management", credits: 3, semester: 5 },
  { code: "CSET305", title: "High Performance Computing", credits: 4, semester: 5 },
  { code: "CSET304", title: "Competitive Programming", credits: 2, semester: 5 },
  {
    code: "CSET303",
    title: "Seminar on Special Topics in Emerging Areas",
    credits: 1,
    semester: 5
  },
  {
    code: "CSET302",
    title: "Automata Theory and Computability",
    credits: 4,
    semester: 5
  },
  {
    code: "CSET301",
    title: "Artificial Intelligence and Machine Learning",
    credits: 6,
    semester: 5
  }
];

export const listCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const collegeId = req.authUser?.collegeId;
  if (!collegeId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  let courses = await CourseModel.find({ collegeId }).sort({ semester: 1, code: 1 });

  // Initial seed if there are no courses yet for this college
  if (!courses.length) {
    const year = new Date().getFullYear();
    const academicYear = `${year}-${year + 1}`;
    await CourseModel.insertMany(
      DEFAULT_COURSES.map((c) => ({
        ...c,
        academicYear,
        collegeId,
        createdBy: req.authUser?.id
      }))
    );
    courses = await CourseModel.find({ collegeId }).sort({ semester: 1, code: 1 });
  } else {
    // Backfill any newly added DEFAULT_COURSES (e.g. new semester) that are missing
    const existingCodes = new Set(courses.map((c) => c.code));
    const missingDefaults = DEFAULT_COURSES.filter((c) => !existingCodes.has(c.code));

    if (missingDefaults.length) {
      // Reuse the academic year from existing records if available, otherwise use current year
      const existingAcademicYear = courses[0]?.academicYear as string | undefined;
      const year = new Date().getFullYear();
      const fallbackAcademicYear = `${year}-${year + 1}`;
      const academicYear = existingAcademicYear || fallbackAcademicYear;

      await CourseModel.insertMany(
        missingDefaults.map((c) => ({
          ...c,
          academicYear,
          collegeId,
          createdBy: req.authUser?.id
        }))
      );

      courses = await CourseModel.find({ collegeId }).sort({ semester: 1, code: 1 });
    }
  }

  res.json({ status: StatusCodes.OK, data: courses });
});

export const createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      code: "AUTH_REQUIRED",
      message: "Authentication required"
    });
  }

  const course = await CourseModel.create({
    ...req.body,
    collegeId: req.authUser.collegeId,
    createdBy: req.authUser.id
  });

  res.status(StatusCodes.CREATED).json({ status: StatusCodes.CREATED, data: course });
});
