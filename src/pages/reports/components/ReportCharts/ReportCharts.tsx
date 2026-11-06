import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./ReportCharts.css";

export interface ReportBarSeries {
  dataKey: string;
  name: string;
  color: string;
}

export interface ReportBarData {
  name: string;
  [key: string]: string | number;
}

export interface ReportCircleData {
  id: string;
  name: string;
  value: number;
  color: string;
  backgroundColor: string;
}

interface ReportChartsProps {
  barData: ReportBarData[];
  barSeries: ReportBarSeries[];
  circleData: ReportCircleData[];
}

function ReportCharts({ barData, barSeries, circleData }: ReportChartsProps) {
  return (
    <div className="report-charts">
      {/* Biểu đồ cột chồng */}
      <div className="report-charts__card">
        <div className="report-charts__bar-layout">
          <div className="report-charts__bar">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                barSize={26}
                margin={{
                  top: 20,
                  right: 0,
                  left: -20,
                  bottom: 0,
                }}>
                <CartesianGrid
                  vertical={false}
                  stroke="#E0E0E0"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{
                    fill: "#666666",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#666666",
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                {barSeries.map((series) => (
                  <Bar
                    key={series.dataKey}
                    dataKey={series.dataKey}
                    name={series.name}
                    stackId="report"
                    fill={series.color}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chú thích biểu đồ */}
          <div className="report-charts__legend">
            {barSeries.map((series) => (
              <div key={series.dataKey} className="report-charts__legend-item">
                <span
                  className="report-charts__legend-color"
                  style={{
                    backgroundColor: series.color,
                  }}
                />

                <span>{series.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Các vòng tròn thống kê */}
      {circleData.map((item) => (
        <div
          key={item.id}
          className="report-charts__card report-charts__circle-card">
          <div
            className="report-charts__circle"
            style={{
              backgroundColor: item.backgroundColor,
              borderColor: item.color,
              color: item.color,
            }}>
            {item.value}
          </div>

          <div className="report-charts__circle-legend">
            <span
              className="report-charts__legend-color"
              style={{
                backgroundColor: item.color,
              }}
            />

            <span>{item.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReportCharts;
