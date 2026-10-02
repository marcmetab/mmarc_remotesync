import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { SessionOption } from "../hooks/useRaceData";
import { coordsForLocation, latLonToVector3 } from "../lib/circuitCoords";
import {
  GLOBE_BORDER_PATH,
  GLOBE_LAND_PATH,
  GLOBE_TEX,
} from "../lib/globeLandPath";
import { SANS, T } from "../lib/tokens";

export type MapRace = {
  sessionId: number;
  eventName: string;
  location: string;
  country: string | null;
  lat: number;
  lon: number;
};

const GLOBE_RADIUS = 1;
const MARKER_RADIUS = 0.028;

type MarkerUserData = { race: MapRace };

type GlobeInternals = {
  markersGroup: THREE.Group;
  markerGeom: THREE.SphereGeometry;
  markerMat: THREE.MeshStandardMaterial;
  haloMat: THREE.MeshBasicMaterial;
};

/**
 * Drag to spin, scroll to zoom, click a circuit pin to open race replay.
 * Renders inside a shadow root so OrbitControls work under the data-app sandbox.
 */
export function SeasonGlobe({
  races,
  onSelect,
}: {
  races: readonly MapRace[];
  onSelect: (sessionId: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const internalsRef = useRef<GlobeInternals | null>(null);

  const [hovered, setHovered] = useState<MapRace | null>(null);
  const [ready, setReady] = useState(false);

  const raceKey = useMemo(
    () => races.map((r) => `${r.sessionId}:${r.lat}:${r.lon}`).join("|"),
    [races],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";

    // OrbitControls binds keydown on the canvas root. The data-app sandbox
    // blocks document listeners, so the canvas lives in a shadow root.
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    root.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0.35, 0.55, 2.55);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 1.45;
    controls.maxDistance = 4.2;
    controls.rotateSpeed = 0.75;
    controls.zoomSpeed = 1.15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;

    let interacting = false;
    const pauseSpin = () => {
      interacting = true;
      controls.autoRotate = false;
      renderer.domElement.style.cursor = "grabbing";
    };
    const resumeSpinLater = () => {
      interacting = false;
      renderer.domElement.style.cursor = "grab";
      window.setTimeout(() => {
        if (!interacting) {
          controls.autoRotate = true;
        }
      }, 1800);
    };
    controls.addEventListener("start", pauseSpin);
    controls.addEventListener("end", resumeSpinLater);

    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(4, 2.4, 3.2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xb7d4ef, 0.35);
    fill.position.set(-3, -1, -2);
    scene.add(fill);

    const earthTex = buildEarthTexture();
    earthTex.colorSpace = THREE.SRGBColorSpace;
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.92,
      metalness: 0.04,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 96, 64), earthMat);
    scene.add(earth);

    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x7eb7de,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 48),
      atmosphereMat,
    );
    scene.add(atmosphere);

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    const markerGeom = new THREE.SphereGeometry(MARKER_RADIUS, 20, 16);
    const markerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(T.accent),
      emissive: new THREE.Color(T.accent),
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0.15,
    });
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(T.accent),
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });

    internalsRef.current = { markersGroup, markerGeom, markerMat, haloMat };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = new THREE.Vector2();
    let dragPixels = 0;

    const pickMarker = (clientX: number, clientY: number): MapRace | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markersGroup.children, false);
      const hit = hits.find((h) => (h.object.userData as MarkerUserData).race);
      return hit ? (hit.object.userData as MarkerUserData).race : null;
    };

    const onPointerMove = (event: PointerEvent) => {
      dragPixels = Math.max(
        dragPixels,
        Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y),
      );
      const race = pickMarker(event.clientX, event.clientY);
      setHovered(race);
      if (!interacting) {
        renderer.domElement.style.cursor = race ? "pointer" : "grab";
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerDown.set(event.clientX, event.clientY);
      dragPixels = 0;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragPixels > 6) {
        return;
      }
      const race = pickMarker(event.clientX, event.clientY);
      if (race) {
        onSelectRef.current(race.sessionId);
      }
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();
    setReady(true);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      controls.removeEventListener("start", pauseSpin);
      controls.removeEventListener("end", resumeSpinLater);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      internalsRef.current = null;
      markerGeom.dispose();
      markerMat.dispose();
      haloMat.dispose();
      earth.geometry.dispose();
      earthMat.dispose();
      earthTex.dispose();
      atmosphere.geometry.dispose();
      atmosphereMat.dispose();
      renderer.dispose();
      root.replaceChildren();
      setReady(false);
      setHovered(null);
    };
  }, []);

  useEffect(() => {
    const internals = internalsRef.current;
    if (!internals) {
      return;
    }
    const { markersGroup, markerGeom, markerMat, haloMat } = internals;
    while (markersGroup.children.length > 0) {
      markersGroup.remove(markersGroup.children[0]!);
    }
    for (const race of races) {
      const pos = latLonToVector3(race.lat, race.lon, GLOBE_RADIUS * 1.012);
      const pin = new THREE.Mesh(markerGeom, markerMat);
      pin.position.set(pos.x, pos.y, pos.z);
      pin.userData = { race } satisfies MarkerUserData;

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(MARKER_RADIUS * 2.1, 16, 12),
        haloMat,
      );
      halo.position.copy(pin.position);
      halo.userData = { race } satisfies MarkerUserData;

      markersGroup.add(halo);
      markersGroup.add(pin);
    }
    setHovered(null);
  }, [raceKey, races]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(62vh, 560px)",
        minHeight: 360,
        borderRadius: T.radius,
        border: `1px solid ${T.border}`,
        background:
          "radial-gradient(ellipse at 50% 42%, #1a3148 0%, #0d1824 58%, #090e14 100%)",
        overflow: "hidden",
        fontFamily: SANS,
        boxShadow: "0 18px 40px rgba(23,25,31,0.12)",
      }}
    >
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />

      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
          }}
        >
          Loading globe…
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(9,14,20,0.55)",
          color: "rgba(255,255,255,0.78)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.2,
          pointerEvents: "none",
        }}
      >
        Drag to spin · scroll to zoom
      </div>

      {hovered && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            maxWidth: "min(340px, calc(100% - 32px))",
            padding: "11px 14px",
            borderRadius: T.radiusSm,
            background: "rgba(255,255,255,0.96)",
            border: `1px solid ${T.border}`,
            boxShadow: "0 10px 28px rgba(23,25,31,0.16)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 750, color: T.text }}>
            {hovered.eventName}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: T.textDim }}>
            {hovered.location}
            {hovered.country ? ` · ${hovered.country}` : ""}
            {" · "}
            Click to open race replay
          </div>
        </div>
      )}

      {races.length === 0 && ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,0.75)",
            fontSize: 14,
            background: "rgba(9,14,20,0.35)",
            pointerEvents: "none",
          }}
        >
          No races loaded for this year.
        </div>
      )}
    </div>
  );
}

export function racesForYear(
  sessions: readonly SessionOption[],
  year: number,
): MapRace[] {
  const byLocation = new Map<string, SessionOption>();
  for (const session of sessions) {
    if (session.year !== year) {
      continue;
    }
    const name = session.sessionName.toLowerCase();
    if (name !== "race" && name !== "sprint") {
      continue;
    }
    const key = session.location ?? session.eventName;
    const existing = byLocation.get(key);
    if (!existing) {
      byLocation.set(key, session);
      continue;
    }
    const existingIsRace = existing.sessionName.toLowerCase() === "race";
    if (name === "race" && !existingIsRace) {
      byLocation.set(key, session);
    }
  }

  const races: MapRace[] = [];
  for (const session of byLocation.values()) {
    const coords = coordsForLocation(session.location);
    if (!coords) {
      continue;
    }
    races.push({
      sessionId: session.sessionId,
      eventName: session.eventName,
      location: session.location ?? session.eventName,
      country: session.country,
      lat: coords.lat,
      lon: coords.lon,
    });
  }

  races.sort((a, b) => a.lon - b.lon || b.lat - a.lat);
  return races;
}

function buildEarthTexture(): THREE.CanvasTexture {
  const { width, height } = GLOBE_TEX;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const ocean = ctx.createLinearGradient(0, 0, 0, height);
  ocean.addColorStop(0, "#1F5F8F");
  ocean.addColorStop(0.45, "#2A7BB0");
  ocean.addColorStop(1, "#1A527A");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (const lat of [-60, -30, 0, 30, 60]) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const land = new Path2D(GLOBE_LAND_PATH);
  ctx.fillStyle = "#E8DFD0";
  ctx.fill(land);
  ctx.strokeStyle = "rgba(210, 199, 180, 0.85)";
  ctx.lineWidth = 0.8;
  ctx.stroke(land);

  const borders = new Path2D(GLOBE_BORDER_PATH);
  ctx.strokeStyle = "rgba(90, 110, 128, 0.55)";
  ctx.lineWidth = 0.55;
  ctx.stroke(borders);

  const north = ctx.createLinearGradient(0, 0, 0, height * 0.08);
  north.addColorStop(0, "rgba(255,255,255,0.55)");
  north.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = north;
  ctx.fillRect(0, 0, width, height * 0.08);

  const south = ctx.createLinearGradient(0, height * 0.92, 0, height);
  south.addColorStop(0, "rgba(255,255,255,0)");
  south.addColorStop(1, "rgba(255,255,255,0.45)");
  ctx.fillStyle = south;
  ctx.fillRect(0, height * 0.92, width, height * 0.08);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
