export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers: Record<string, string>,
  filename = "export.csv"
) {
  const keys = Object.keys(headers);
  const csvRows = [keys.map((k) => headers[k]).join(",")];

  for (const row of data) {
    const values = keys.map((key) => {
      const val = row[key];
      const str = val == null ? "" : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
