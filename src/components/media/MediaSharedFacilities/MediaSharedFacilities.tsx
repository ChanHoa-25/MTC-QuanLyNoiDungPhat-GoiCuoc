import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import AppFilter, { AppFilterField } from "../../common/AppFilter";
import AppSelect from "../../common/AppSelect";
import AppSearch from "../../common/AppSearch";
import AppDateRangePicker from "../../common/AppDateRangePicker";
import AppTable from "../../common/AppTable";
import AppStatusTag from "../../common/AppStatusTag";

import "./MediaSharedFacilities.css";

interface MediaSharedFacilitiesProps {
  mediaId: string;
  data?: SharedFacility[];
}

export interface SharedFacility {
  id: string;
  facilityName: string;
  sharedAt: string;
  status: "Đã tiếp nhận" | "Chưa tiếp nhận";
}

const demoFacilities: SharedFacility[] = [
  {
    id: "1",
    facilityName: "Cơ sở 1",
    sharedAt: "2021-07-25T19:00:00",
    status: "Đã tiếp nhận",
  },
  {
    id: "2",
    facilityName: "Cơ sở 2",
    sharedAt: "2021-07-25T19:00:00",
    status: "Đã tiếp nhận",
  },
  {
    id: "3",
    facilityName: "Cơ sở 3",
    sharedAt: "2021-07-25T19:00:00",
    status: "Đã tiếp nhận",
  },
  {
    id: "4",
    facilityName: "Cơ sở 4",
    sharedAt: "2021-07-25T19:00:00",
    status: "Đã tiếp nhận",
  },
  {
    id: "5",
    facilityName: "Cơ sở 6",
    sharedAt: "2021-07-25T19:00:00",
    status: "Đã tiếp nhận",
  },
  {
    id: "6",
    facilityName: "Cơ sở 7",
    sharedAt: "2021-07-25T19:00:00",
    status: "Đã tiếp nhận",
  },
  {
    id: "7",
    facilityName: "Cơ sở 89",
    sharedAt: "2021-07-25T19:00:00",
    status: "Chưa tiếp nhận",
  },
  {
    id: "8",
    facilityName: "Cơ sở 82",
    sharedAt: "2021-07-25T19:00:00",
    status: "Đã tiếp nhận",
  },
];

const PAGE_SIZE = 10;

function MediaSharedFacilities({
  data = demoFacilities,
}: MediaSharedFacilitiesProps) {
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const [status, setStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (status !== "all" && item.status !== status) {
        return false;
      }

      if (
        keyword.trim() &&
        !item.facilityName.toLowerCase().includes(keyword.trim().toLowerCase())
      ) {
        return false;
      }

      const sharedDate = dayjs(item.sharedAt);

      if (dates[0] && sharedDate.isBefore(dates[0], "day")) {
        return false;
      }

      if (dates[1] && sharedDate.isAfter(dates[1], "day")) {
        return false;
      }

      return true;
    });
  }, [data, dates, status, keyword]);

  const columns: ColumnsType<SharedFacility> = [
    {
      title: "Cơ sở chia sẻ",
      dataIndex: "facilityName",
      key: "facilityName",
      width: 240,
    },
    {
      title: "Thời gian chia sẻ",
      dataIndex: "sharedAt",
      key: "sharedAt",
      width: 285,
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Trạng thái tiếp nhận",
      dataIndex: "status",
      key: "status",
      render: (value: SharedFacility["status"]) => (
        <AppStatusTag
          type="status"
          variant={value === "Đã tiếp nhận" ? "green" : "blue"}
          label={value}
        />
      ),
    },
  ];

  return (
    <div className="media-shared-facilities">
      <h2 className="media-shared-facilities__title">
        Theo dõi tình trạng chia sẻ của nguồn tin
      </h2>

      <AppFilter
        showActions={false}
        className="media-shared-facilities__filter"
        gap={20}>
        <AppFilterField width={438}>
          <label className="media-shared-facilities__label">
            Thời gian chia sẻ
          </label>

          <AppDateRangePicker
            width="100%"
            value={dates}
            onChange={(value) => {
              setDates(value);
              setCurrentPage(1);
            }}
          />
        </AppFilterField>

        <AppFilterField width={238}>
          <label className="media-shared-facilities__label">Trạng thái</label>

          <AppSelect
            width="100%"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setCurrentPage(1);
            }}
            options={[
              {
                value: "all",
                label: "Tất cả",
              },
              {
                value: "Đã tiếp nhận",
                label: "Đã tiếp nhận",
              },
              {
                value: "Chưa tiếp nhận",
                label: "Chưa tiếp nhận",
              },
            ]}
          />
        </AppFilterField>

        <AppFilterField width={454}>
          <label className="media-shared-facilities__label">Từ khóa</label>

          <AppSearch
            width="100%"
            placeholder="Tên cơ sở"
            value={keyword}
            onChange={(value) => {
              setKeyword(value);
              setCurrentPage(1);
            }}
          />
        </AppFilterField>
      </AppFilter>

      <AppTable<SharedFacility>
        className="media-shared-facilities__table"
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total: filteredData.length,
          onChange: setCurrentPage,
        }}
        locale={{
          emptyText: "Không có cơ sở phù hợp",
        }}
      />
    </div>
  );
}

export default MediaSharedFacilities;
