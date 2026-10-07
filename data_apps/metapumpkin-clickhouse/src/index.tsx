import type { DataAppFactory } from "@metabase/embedding-sdk-react/data-app";

import App from "./App";
import { sdkTheme } from "./theme";

// The data app's entry point. Return the root component plus any `providerProps`
// the host should apply to `MetabaseProvider` (e.g. `theme`,
// `allowedCustomVisualizations`). The host reads them once, so the SDK theme is
// the viewer's system preference at load, light or dark (theme.ts sdkLoadTheme).
const factory: DataAppFactory = () => ({
  component: App,
  providerProps: { theme: sdkTheme },
});

export default factory;
