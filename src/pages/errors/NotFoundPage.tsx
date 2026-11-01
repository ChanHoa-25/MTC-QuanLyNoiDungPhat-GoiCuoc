import ErrorPage from "./ErrorPage";
import error404 from "../../assets/images/404.png";

function NotFoundPage() {
  return (
    <ErrorPage
      title="404 Error."
      subtitle="We couldn’t connect to this page."
      description="Looks like something is disconnected. The page you requested was not found, but there are several ways to get you back on the right track. You can go back to the previous page, or visit our home page."
      image={error404}
      imageAlt="404 Error"
    />
  );
}

export default NotFoundPage;
