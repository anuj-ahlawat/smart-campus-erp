"use client";

import toast from "react-hot-toast";

type ToastOptions = {
  title: string;
  description?: string;
};

export const Toast = {
  success: ({ title, description }: ToastOptions) =>
    toast.success(description ? `${title} — ${description}` : title),
  error: ({ title, description }: ToastOptions) =>
    toast.error(description ? `${title} — ${description}` : title),
  info: ({ title, description }: ToastOptions) =>
    toast(description ? `${title} — ${description}` : title)
};


