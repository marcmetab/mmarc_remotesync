import {
  DataAppRouter,
  useDataAppLocation,
} from "@metabase/embedding-sdk-react/data-app";
import { useEffect, useMemo, useState } from "react";

import { Combobox, type ComboOption } from "./components/Combobox";
import { EmptyState, Spinner } from "./components/Card";
import { GlobeButton } from "./components/GlobeButton";
import { Shell } from "./components/Shell";
import { useRaceData, useSessionCatalog } from "./hooks/useRaceData";
import { DriverCatalog } from "./pages/DriverCatalog";
import { DriverDetail } from "./pages/DriverDetail";
import { RaceResults } from "./pages/RaceResults";
import { RaceReplay } from "./pages/RaceReplay";
import { SeasonMap } from "./pages/SeasonMap";
import { T } from "./lib/tokens";

export default function App() {
  return (
    <DataAppRouter>
      <AppContent />
    </DataAppRouter>
  );
}

function AppContent() {
  const { pathname, navigate } = useDataAppLocation();
  const catalog = useSessionCatalog();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const catalogDriverMatch = pathname.match(/^\/driver-catalog\/(\d+)\/(\d+)$/);
  const catalogDriverSessionId = catalogDriverMatch ? Number(catalogDriverMatch[1]) : null;
  const activeSessionId = catalogDriverSessionId ?? sessionId;

  useEffect(() => {
    if (catalogDriverSessionId != null) setSessionId(catalogDriverSessionId);
  }, [catalogDriverSessionId]);

  // Land on a real session as soon as the catalog arrives, so the app never
  // boots to an empty shell.
  useEffect(() => {
    if (catalogDriverSessionId == null && sessionId == null && catalog.defaultSessionId != null) {
      setSessionId(catalog.defaultSessionId);
    }
  }, [catalogDriverSessionId, sessionId, catalog.defaultSessionId]);

  const race = useRaceData(activeSessionId);

  const session = useMemo(
    () => catalog.sessions.find((s) => s.sessionId === activeSessionId) ?? null,
    [catalog.sessions, activeSessionId],
  );

  const sessionOptions = useMemo<ComboOption[]>(
    () =>
      catalog.sessions.map((s) => ({
        value: String(s.sessionId),
        label: `${s.eventName}${s.year != null ? ` ${s.year}` : ""} · ${s.sessionName}`,
        hint: s.location ?? undefined,
      })),
    [catalog.sessions],
  );

  const openRaceReplay = (nextSessionId: number) => {
    setSessionId(nextSessionId);
    navigate("/");
  };

  const picker = (
    <div className="f1-session-cluster">
      <GlobeButton />
      <Combobox
        options={sessionOptions}
        value={activeSessionId != null ? String(activeSessionId) : null}
        onChange={(value) => {
          setSessionId(Number(value));
          if (catalogDriverMatch) navigate("/results");
        }}
        placeholder="Select a session"
        ariaLabel="Session"
        width="100%"
        disabled={catalog.isLoading || sessionOptions.length === 0}
      />
    </div>
  );

  return (
    <Shell headerRight={pathname === "/driver-catalog" ? <div className="f1-catalog-context"><GlobeButton/><span>All loaded drivers</span></div> : picker}>
      <Body
        pathname={pathname}
        sessionId={activeSessionId}
        session={session}
        sessions={catalog.sessions}
        race={race}
        catalogLoading={catalog.isLoading}
        catalogReady={catalog.isReady}
        catalogError={catalog.error}
        raceError={race.error}
        onSelectRace={openRaceReplay}
      />
    </Shell>
  );
}

function Body({
  pathname,
  sessionId,
  session,
  sessions,
  race,
  catalogLoading,
  catalogReady,
  catalogError,
  raceError,
  onSelectRace,
}: {
  pathname: string;
  sessionId: number | null;
  session: ReturnType<typeof useSessionCatalog>["sessions"][number] | null;
  sessions: ReturnType<typeof useSessionCatalog>["sessions"];
  race: ReturnType<typeof useRaceData>;
  catalogLoading: boolean;
  catalogReady: boolean;
  catalogError: unknown;
  raceError: unknown;
  onSelectRace: (sessionId: number) => void;
}) {
  if (catalogError) {
    return (
      <EmptyState>
        Could not load session data from Metabase.
        <br />
        <span style={{ color: T.textFaint }}>
          Check that the app&apos;s collection has access to the F1 tables.
        </span>
      </EmptyState>
    );
  }

  if (pathname === "/map" || pathname.startsWith("/map/")) {
    return (
      <SeasonMap
        sessions={sessions}
        isLoading={catalogLoading}
        onSelectRace={onSelectRace}
      />
    );
  }

  if (pathname === "/driver-catalog") {
    return catalogLoading || !catalogReady
      ? <Spinner label="Loading driver catalog…" />
      : <DriverCatalog sessions={sessions} />;
  }

  if (raceError) {
    return (
      <EmptyState>
        Could not load session data from Metabase.
        <br />
        <span style={{ color: T.textFaint }}>
          Check that the app&apos;s collection has access to the F1 tables.
        </span>
      </EmptyState>
    );
  }

  if (catalogLoading && sessionId == null) {
    return <Spinner label="Loading sessions…" />;
  }

  if (sessionId == null) {
    return <EmptyState>No sessions are loaded in this database.</EmptyState>;
  }

  const catalogDriverMatch = pathname.match(/^\/driver-catalog\/(\d+)\/(\d+)$/);
  const driverMatch = pathname.match(/^\/drivers\/(\d+)$/);
  const driverNumber = catalogDriverMatch ? Number(catalogDriverMatch[2]) : driverMatch ? Number(driverMatch[1]) : null;
  if (driverNumber != null) {
    return (
      <DriverDetail
        // A new session or driver starts the lap from the top.
        key={`${sessionId}:${driverNumber}`}
        sessionId={sessionId}
        session={session}
        race={race}
        driverNumber={driverNumber}
        backTo={catalogDriverMatch ? "/driver-catalog" : "/results"}
        backLabel={catalogDriverMatch ? "Driver Catalog" : "Race Results"}
      />
    );
  }

  if (pathname === "/results" || pathname === "/drivers") {
    return <RaceResults race={race} />;
  }

  // `/` and anything unmatched resolve to the default screen.
  return <RaceReplay sessionId={sessionId} session={session} race={race} />;
}
