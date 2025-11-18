export const formatDate = (input: string | Date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(typeof input === "string" ? new Date(input) : input);

export const getWeekRange = (date = new Date()) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

