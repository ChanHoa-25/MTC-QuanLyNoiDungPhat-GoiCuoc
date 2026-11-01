import { useNavigate } from "react-router-dom";

import AppButton from "../../components/common/AppButton";
import Logo from "../../assets/images/Logo.png";
import { ROUTES } from "../../constants/route.constants";

import "./ErrorPage.css";

interface ErrorPageProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt?: string;
}

function ErrorPage({
  title,
  subtitle,
  description,
  image,
  imageAlt = "Error illustration",
}: ErrorPageProps) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  return (
    <main className="error-page">
      <header className="error-page-header">
        <div className="error-page-brand">
          <img src={Logo} alt="MTC" className="error-page-logo" />
          <span className="error-page-brand-name">
            Multimedia Terminal Controller
          </span>
        </div>
      </header>

      <div className="error-page-content">
        <section className="error-page-info">
          <h1 className="error-page-title">{title}</h1>

          <h2 className="error-page-subtitle">{subtitle}</h2>

          <p className="error-page-description">{description}</p>

          <AppButton
            variant="primary"
            width={464}
            height={48}
            className="error-page-button"
            onClick={handleConfirm}>
            Xác nhận
          </AppButton>
        </section>

        <div className="error-page-illustration">
          <img src={image} alt={imageAlt} />
        </div>
      </div>
    </main>
  );
}

export default ErrorPage;
