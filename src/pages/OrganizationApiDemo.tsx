import { useEffect, useState } from "react";
import { Alert, Card, Spin } from "antd";
import { organizationApi } from "../api/organizationApi";

export default function OrganizationApiDemo() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<unknown[]>([]);

  useEffect(() => {
    let active = true;

    const fetchOrganizations = async () => {
      try {
        const response = await organizationApi.getAll();

        if (!active) return;

        if (!response.success) {
          throw new Error(response.message);
        }

        setData(response.data);
      } catch (err) {
        if (!active) return;

        setError(err instanceof Error ? err.message : "Lỗi kết nối API");
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchOrganizations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card title="Kiểm tra API Organizations">
      {loading ? (
        <Spin />
      ) : error ? (
        <Alert type="error" message={error} showIcon />
      ) : (
        <>
          <Alert type="success" message="Kết nối API thành công!" showIcon />

          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </Card>
  );
}
