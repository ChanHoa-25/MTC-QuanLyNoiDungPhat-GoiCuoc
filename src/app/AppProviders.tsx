import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { SiteProvider } from "../contexts/SiteContext";

interface AppProvidersProps {
  children: ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          // Màu sắc
          colorPrimary: "#F26D21",
          colorInfo: "#F26D21",
          colorSuccess: "#52C41A",
          colorWarning: "#FAAD14",
          colorError: "#FF4D4F",

          // Typography
          fontFamily: '"Open Sans", sans-serif',

          // Kích thước
          borderRadius: 8,
          controlHeight: 40,
        },

        components: {
          Menu: {
            itemSelectedBg: "#FFF1E8",
            itemSelectedColor: "#F26D21",
            itemHoverBg: "#FFF7F2",
          },

          Table: {
            headerBg: "#FCE2D3",
          },

          Checkbox: {
            colorPrimary: "#F26D21",
            colorPrimaryHover: "#F26D21",
            colorBorder: "#F26D21",
            borderRadiusSM: 4,
          },
        },
      }}>
      <SiteProvider>{children}</SiteProvider>
    </ConfigProvider>
  );
}

export default AppProviders;
