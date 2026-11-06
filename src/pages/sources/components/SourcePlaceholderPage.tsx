import ComingSoonPage from "../../ComingSoonPage";
import SourceNavigationTabs from "./SourceNavigationTabs";

interface SourcePlaceholderPageProps {
  title: string;
}

function SourcePlaceholderPage({ title }: SourcePlaceholderPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <SourceNavigationTabs />
      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          padding: 24,
        }}>
        <ComingSoonPage title={title} />
      </div>
    </div>
  );
}

export default SourcePlaceholderPage;
