type CsvRow = Record<string, string | number | boolean | null | undefined>;

export const exportCSV = (filename: string, rows: CsvRow[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === undefined || value === null) return "";
          const needsQuote = /[",\n]/.test(String(value));
          return needsQuote ? `"${String(value).replace(/"/g, '""')}"` : value;
        })
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

