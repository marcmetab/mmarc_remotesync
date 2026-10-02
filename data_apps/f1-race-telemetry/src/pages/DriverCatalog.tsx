import { DataAppLink } from "@metabase/embedding-sdk-react/data-app";
import { useMemo, useState, type CSSProperties } from "react";

import { EmptyState, Spinner } from "../components/Card";
import { Headshot } from "../components/Headshot";
import {
  useDriverCatalog,
  type CatalogDriver,
  type SessionOption,
} from "../hooks/useRaceData";
import { flagEmoji, teamColor } from "../lib/format";

import "./DriverCatalog.css";

function matchesSearch(driver: CatalogDriver, query: string): boolean {
  if (!query) return true;
  return [
    driver.fullName,
    ...driver.aliases,
    driver.abbreviation,
    String(driver.driverNumber),
    driver.teamName ?? "",
    driver.countryCode ?? "",
  ].some((value) => value.toLocaleLowerCase().includes(query));
}

function DriverCard({ driver }: { driver: CatalogDriver }) {
  const color = teamColor(driver.teamColorRaw);
  const flag = flagEmoji(driver.countryCode);
  const yearLabel = driver.seasons.length === 1 ? "season" : "seasons";
  const sessionLabel = driver.sessionCount === 1 ? "session" : "sessions";

  return (
    <DataAppLink
      to={`/driver-catalog/${driver.sessionId}/${driver.driverNumber}`}
      className="f1-catalog-card"
      style={{ "--catalog-team": color } as CSSProperties}
      aria-label={`Open ${driver.fullName} driver profile`}
    >
      <span className="f1-catalog-card-stage" aria-hidden="true">
        <span className="f1-catalog-card-number">{driver.driverNumber}</span>
        <span className="f1-catalog-card-portrait">
          <Headshot
            url={driver.headshotUrl}
            color={color}
            size={146}
            initials={driver.abbreviation}
          />
        </span>
        <span className="f1-catalog-card-short">{driver.abbreviation}</span>
      </span>

      <span className="f1-catalog-card-content">
        <span className="f1-catalog-card-team">
          <span className="f1-catalog-card-team-mark" aria-hidden="true" />
          {driver.teamName ?? "Independent driver"}
          {driver.year != null && <span className="f1-catalog-card-year">{driver.year}</span>}
        </span>
        <span className="f1-catalog-card-name">
          {flag && <span className="f1-catalog-card-flag" aria-label={driver.countryCode ?? undefined}>{flag}</span>}
          <span>{driver.fullName}</span>
        </span>
        <span className="f1-catalog-card-meta">
          <span>{driver.seasons.length} {yearLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{driver.sessionCount} {sessionLabel}</span>
        </span>
        <span className="f1-catalog-card-open">
          View driver <span aria-hidden="true">↗</span>
        </span>
      </span>
    </DataAppLink>
  );
}

export function DriverCatalog({ sessions }: { sessions: readonly SessionOption[] }) {
  const { drivers, isLoading, isReady, error } = useDriverCatalog(sessions);
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("all");

  const teams = useMemo(
    () => [...new Set(drivers.map((driver) => driver.teamName).filter((name): name is string => Boolean(name)))].sort(),
    [drivers],
  );
  const seasons = useMemo(
    () => new Set(drivers.flatMap((driver) => driver.seasons)).size,
    [drivers],
  );
  const visibleDrivers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return drivers
      .filter((driver) => team === "all" || driver.teamName === team)
      .filter((driver) => matchesSearch(driver, query))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [drivers, search, team]);

  if (!isReady || (isLoading && drivers.length === 0)) return <Spinner label="Loading driver catalog…" />;
  if (error && drivers.length === 0) {
    return <EmptyState>Could not load the driver catalog.</EmptyState>;
  }
  if (drivers.length === 0) {
    return <EmptyState>No drivers are available in the loaded sessions.</EmptyState>;
  }

  return (
    <div className="f1-catalog-page">
      <header className="f1-catalog-intro">
        <div>
          <p className="f1-catalog-kicker">The paddock / Driver index</p>
          <h1>Driver catalog<span className="f1-catalog-period">.</span></h1>
          <p className="f1-catalog-description">
            Meet the drivers across the available race and sprint sessions. Explore the grid, then open a driver for their cockpit telemetry.
          </p>
        </div>
        <div className="f1-catalog-summary" aria-label="Catalog summary">
          <div><strong>{drivers.length}</strong><span>Drivers</span></div>
          <div><strong>{teams.length}</strong><span>Teams</span></div>
          <div><strong>{seasons}</strong><span>Seasons</span></div>
        </div>
      </header>

      <div className="f1-catalog-toolbar">
        <label className="f1-catalog-search">
          <span className="f1-catalog-control-label">Search drivers</span>
          <span className="f1-catalog-search-field">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="10.7" cy="10.7" r="6.7" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, number, team…"
            />
          </span>
        </label>

        <label className="f1-catalog-team-filter">
          <span className="f1-catalog-control-label">Latest team</span>
          <select value={team} onChange={(event) => setTeam(event.target.value)}>
            <option value="all">All teams</option>
            {teams.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>

        <span className="f1-catalog-result-count" aria-live="polite">
          {visibleDrivers.length} {visibleDrivers.length === 1 ? "driver" : "drivers"}
        </span>
      </div>

      {visibleDrivers.length > 0 ? (
        <section className="f1-catalog-grid" aria-label="Drivers">
          {visibleDrivers.map((driver) => <DriverCard key={`${driver.sessionId}-${driver.driverNumber}`} driver={driver} />)}
        </section>
      ) : (
        <div className="f1-catalog-empty">
          <strong>No drivers found</strong>
          <span>Try another name or team.</span>
          <button type="button" onClick={() => { setSearch(""); setTeam("all"); }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
