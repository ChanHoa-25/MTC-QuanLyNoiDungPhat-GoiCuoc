import ErrorPage from "./ErrorPage";
import error403 from "../../assets/images/403.png";

function ForbiddenPage() {
  return (
    <ErrorPage
      title="403 Error."
      subtitle="We couldn’t connect to this page."
      description="Looks like something is disconnected. The page you requested was not found, but there are several ways to get you back on the right track. You can go back to the previous page , or visit our home page."
      image={error403}
      imageAlt="403 Error"
    />
  );
}

export default ForbiddenPage;
