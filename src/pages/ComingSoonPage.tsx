import { Result } from "antd";

interface ComingSoonPageProps {
  title: string;
}

function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <Result
      status="info"
      title={title}
      subTitle="Chức năng này đang được phát triển."
    />
  );
}

export default ComingSoonPage;
