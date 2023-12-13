import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { enableReactUse } from "@legendapp/state/config/enableReactUse";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "react-query";
enableReactUse();
import './i18n/i18n.ts';
import {I18nextProvider} from "react-i18next";
import i18n from "i18next";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
          <I18nextProvider i18n={i18n}>
            <ModalsProvider>
              <Notifications />
              <App />
            </ModalsProvider>
          </I18nextProvider>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
