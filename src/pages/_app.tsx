import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import { SSRProvider } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./mainPage.scss";
import Head from "next/head";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SSRProvider>
        <Head>
          <title>Ukrbus</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>

        <Layout>
          <Component {...pageProps} />{" "}
        </Layout>
      </SSRProvider>
    </>
  );
}

export default appWithTranslation(App);
