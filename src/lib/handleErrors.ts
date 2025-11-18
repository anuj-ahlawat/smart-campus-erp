import toast from "react-hot-toast";

type ApiError = {
  status?: number;
  code?: string;
  message?: string;
  details?: unknown;
};

export const handleApiErrors = (error: unknown, fallback = "Something went wrong") => {
  const apiError = (error as ApiError) ?? {};
  const message = apiError.message ?? fallback;
  console.error("CAMU::error", error);
  toast.error(message);
};

export const handleErrors = handleApiErrors;

