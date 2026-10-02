import {
  DataAppRouter,
  useDataAppLocation,
} from "@metabase/embedding-sdk-react/data-app";

import Layout from "./components/Layout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";

function Page() {
  const { pathname } = useDataAppLocation();

  if (pathname === "/about") {
    return <About />;
  }

  if (pathname === "/contact") {
    return <Contact />;
  }

  // Anything else, including the base path `/`, shows the default page.
  return <Home />;
}

export default function App() {
  return (
    <DataAppRouter>
      <Layout>
        <Page />
      </Layout>
    </DataAppRouter>
  );
}
