import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function exportPDF(rows, columns, filename = "export.pdf") {
  if (!rows.length) return;

  const doc = new jsPDF();
  const title = filename.replace(".pdf", "").replace(/-/g, " ").toUpperCase();

  doc.setFontSize(14);
  doc.text(title, 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 24);

  const head = [columns.map((c) => c.label)];
  const body = rows.map((row) =>
    columns.map((c) => {
      const val = typeof c.accessor === "function" ? c.accessor(row) : row[c.accessor];
      return String(val ?? "");
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: 30,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [124, 58, 237] },
  });

  doc.save(filename);
}
