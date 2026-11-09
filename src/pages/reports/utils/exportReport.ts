import { message } from "antd";

export function exportReportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    message.warning("Không có dữ liệu báo cáo để xuất.");
    return;
  }

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((item) =>
    Object.values(item)
      .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );

  const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  message.success(`Đã xuất báo cáo [${filename}] thành công!`);
}
