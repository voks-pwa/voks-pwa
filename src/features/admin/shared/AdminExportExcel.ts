export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  headers: Record<string, string>,
  filename = "export.xls"
) {
  const keys = Object.keys(headers);

  const headerRow = `<tr>${keys.map((k) => `<th>${headers[k]}</th>`).join("")}</tr>`;
  const dataRows = data
    .map(
      (row) =>
        `<tr>${keys.map((key) => {
          const val = row[key];
          const str = val == null ? "" : String(val);
          return `<td>${str}</td>`;
        }).join("")}</tr>`
    )
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table>${headerRow}${dataRows}</table>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
