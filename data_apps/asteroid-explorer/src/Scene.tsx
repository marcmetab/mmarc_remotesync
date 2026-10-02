import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

import { TYPED } from "./fonts";
import {
  EARTH_RADIUS_AU, MOON_DISTANCE_AU, MOON_RADIUS_AU, type OrbitalElements, PLANETS, type Vec3,
  moonOffset, orbitPath, planetElements, positionAt,
} from "./orbits";
import type { SceneTheme } from "./themes";

export type SceneAsteroid = { id: string; name: string; el: OrbitalElements };
export type SceneSelection = SceneAsteroid & { mark: string };

// What the camera keeps centred: the Sun (null), "planet:Earth", or "sel:<designation>".
export type FollowTarget = string | null;
// A requested camera distance from the followed object, e.g. a close-up; `key` makes repeats fire.
export type ZoomRequest = { distance: number; key: number } | null;

type Props = {
  theme: SceneTheme;
  asteroids: SceneAsteroid[];
  selected: SceneSelection[];
  jd: number;
  // While blinking: the "A" date. Each circled asteroid gets a dotted stroke to where it is on "B".
  blinkFromJd: number | null;
  blinkGapDays: number;
  // Pixels on the right covered by floating sleeves; the view centres in what stays visible.
  rightInset: number;
  follow: FollowTarget;
  zoom: ZoomRequest;
  onPick: (asteroid: SceneAsteroid) => void;
  // A click on Earth while the camera is near it; client coordinates of the click.
  onEarthClick?: (x: number, y: number) => void;
};

// Ecliptic (x, y, z) with z toward the ecliptic north pole -> three.js y-up.
const v3 = ([x, y, z]: Vec3) => new THREE.Vector3(x, z, -y);
const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// Camera distance that fits a sphere of `radius` inside both the vertical and horizontal field of view.
function fitDistance(camera: THREE.PerspectiveCamera, radius: number, visibleAspect = camera.aspect) {
  const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
  const hHalf = Math.atan(Math.tan(vHalf) * visibleAspect);
  return (radius * 1.12) / Math.sin(Math.min(vHalf, hHalf));
}

// A soft round grain: photographic silver on the plate, a point of light on the sky.
function grainTexture(core: number, soft: number, light: boolean) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const rgb = light ? "255,255,255" : "0,0,0";
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(core, `rgba(${rgb},0.92)`);
  grad.addColorStop(soft, `rgba(${rgb},0.25)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// Earth in the sky theme: ocean blue with green continents and a polar cap, drawn once to a canvas.
function earthTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#2f6fc0";
  g.fillRect(0, 0, 256, 128);
  const land: [number, number, number, number][] = [
    [40, 40, 26, 30], [58, 88, 14, 26], [120, 38, 30, 20], [132, 72, 18, 28], [180, 42, 46, 22], [214, 92, 16, 10],
  ];
  g.fillStyle = "#4f9a4a";
  for (const [x, y, rx, ry] of land) {
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fillRect(0, 0, 256, 7);
  g.fillRect(0, 121, 256, 7);
  return new THREE.CanvasTexture(c);
}

function dashedOrbit(points: Vec3[], color: string, dash: number, opacity = 0.7) {
  const geom = new THREE.BufferGeometry().setFromPoints(points.map(v3));
  const line = new THREE.Line(geom, new THREE.LineDashedMaterial({ color, dashSize: dash, gapSize: dash * 0.8, transparent: true, opacity }));
  line.computeLineDistances();
  return line;
}

function inkLine(points: THREE.Vector3[], color: string, width: number, dashed: boolean, resolution: THREE.Vector2, dash = 0.02) {
  const geom = new LineGeometry().setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
  const mat = new LineMaterial({ color, linewidth: width, dashed, dashSize: dash, gapSize: dash * 0.75, transparent: true, opacity: 0.95 });
  mat.resolution.copy(resolution);
  const line = new Line2(geom, mat);
  if (dashed) line.computeLineDistances();
  return line;
}

type Body = { mesh: THREE.Mesh; baseRadius: number; realRadius: number };

type Internals = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  cloud: THREE.Points;
  planets: { body: Body; row: (typeof PLANETS)[number] }[];
  moon: Body;
  moonOrbit: THREE.Line;
  selectionGroup: THREE.Group;
  selectionBodies: Body[];
  resolution: THREE.Vector2;
  // World positions the HTML overlay follows each frame, keyed by overlay id.
  anchors: Map<string, THREE.Vector3>;
  ease: { from: number; to: number; start: number } | null;
};

const EASE_MS = 1600;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

// Bodies are drawn big enough to see from afar, shrinking toward true size as the camera closes in.
function sizeBody(b: Body, camera: THREE.PerspectiveCamera) {
  const d = camera.position.distanceTo(b.mesh.position);
  b.mesh.scale.setScalar(Math.max(b.realRadius, Math.min(b.baseRadius, d * b.baseRadius * 0.3)));
}

export function Scene({ theme, asteroids, selected, jd, blinkFromJd, blinkGapDays, rightInset, follow, zoom, onPick, onEarthClick }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const internals = useRef<Internals | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const onEarthRef = useRef(onEarthClick);
  onEarthRef.current = onEarthClick;
  const asteroidsRef = useRef(asteroids);
  asteroidsRef.current = asteroids;
  const insetRef = useRef(rightInset);
  insetRef.current = rightInset;
  const followRef = useRef(follow);
  followRef.current = follow;
  const jdRef = useRef(jd);
  jdRef.current = jd;
  // Camera pose survives a theme switch (which rebuilds the scene).
  const poseRef = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const resizeRef = useRef<() => void>(() => {});
  const [hovered, setHovered] = useState<SceneAsteroid | null>(null);
  const [ready, setReady] = useState(0);

  useEffect(() => {
    const host = hostRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setClearColor(0x000000, 0);
    // OrbitControls listens for keydown on the canvas's root node. The data-app sandbox blocks
    // global keyboard listeners, so the canvas lives in a shadow root, which becomes that root node.
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    renderer.domElement.style.display = "block";
    root.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1e-6, 400);
    camera.position.set(0, 2.1, 3.3);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.0002;
    controls.maxDistance = 60;
    controls.zoomSpeed = 1.4;
    controls.addEventListener("start", () => {
      if (internals.current) internals.current.ease = null;
    });

    const light = theme.glowBlending;
    const blending = light ? THREE.AdditiveBlending : THREE.NormalBlending;

    // The Sun: a burned dark disc on the negative, a warm glow on the sky.
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: grainTexture(0.35, 0.7, light), color: theme.sun, transparent: true, depthWrite: false, blending }));
    sun.scale.setScalar(theme.sunScale);
    scene.add(sun);
    if (light) {
      const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: grainTexture(0.05, 0.3, true), color: "#ff9d2e", transparent: true, opacity: 0.45, depthWrite: false, blending }));
      corona.scale.setScalar(theme.sunScale * 3.2);
      scene.add(corona);
    }

    const planets = PLANETS.map((row) => {
      const isEarth = row.name === "Earth";
      scene.add(dashedOrbit(orbitPath(planetElements(row, jdRef.current), 360), isEarth ? theme.earthOrbit : theme.orbit, 0.018 * Math.max(1, row.el[0])));
      const material = light && isEarth
        ? new THREE.MeshBasicMaterial({ map: earthTexture() })
        : new THREE.MeshBasicMaterial({ color: theme.planet[row.name] });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), material);
      if (light && row.name === "Saturn") {
        const rings = new THREE.Mesh(new THREE.RingGeometry(1.4, 2.2, 48), new THREE.MeshBasicMaterial({ color: "#cdb886", side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
        rings.rotation.x = -Math.PI / 2.4;
        mesh.add(rings);
      }
      scene.add(mesh);
      return { body: { mesh, baseRadius: 0.011 * row.radius, realRadius: isEarth ? EARTH_RADIUS_AU : 0.0002 }, row };
    });

    // The Moon and its orbit: lost at solar-system scale, the reference ring in a close-up.
    const moon: Body = {
      mesh: new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: theme.moon })),
      baseRadius: 0.0035,
      realRadius: MOON_RADIUS_AU,
    };
    scene.add(moon.mesh);
    const ring: Vec3[] = [];
    for (let k = 0; k <= 180; k++) ring.push([MOON_DISTANCE_AU * Math.cos((k / 180) * 2 * Math.PI), MOON_DISTANCE_AU * Math.sin((k / 180) * 2 * Math.PI), 0]);
    const moonOrbit = dashedOrbit(ring, theme.moon, 0.00012, 0.6);
    scene.add(moonOrbit);

    const cloud = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ map: grainTexture(0.25, 0.6, light), color: theme.speck, size: light ? 4 : 5, sizeAttenuation: false, transparent: true, opacity: theme.speckOpacity, depthWrite: false, blending }),
    );
    scene.add(cloud);
    const selectionGroup = new THREE.Group();
    scene.add(selectionGroup);

    const resolution = new THREE.Vector2(1, 1);
    const anchors = new Map<string, THREE.Vector3>();
    internals.current = { camera, controls, cloud, planets, moon, moonOrbit, selectionGroup, selectionBodies: [], resolution, anchors, ease: null };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / Math.max(1, h);
      // Shift the projection centre left by half the covered strip (a view offset keeps picking and labels aligned).
      const inset = Math.min(insetRef.current, w * 0.6);
      if (inset > 0) camera.setViewOffset(w + inset, h, inset, 0, w, h);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      resolution.set(w, h);
      selectionGroup.traverse((o) => {
        if (o instanceof Line2) (o.material as LineMaterial).resolution.copy(resolution);
      });
    };
    resizeRef.current = resize;
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    if (poseRef.current) {
      camera.position.copy(poseRef.current.position);
      controls.target.copy(poseRef.current.target);
    } else {
      // Open framed on the inner solar system out to Mars.
      camera.position.setLength(fitDistance(camera, 1.7));
    }

    // Hover shows a name; a click (not a drag) circles the asteroid.
    const raycaster = new THREE.Raycaster();
    const pick = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.params.Points = { threshold: camera.position.distanceTo(controls.target) * 0.006 };
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(cloud)[0];
      return hit?.index != null ? asteroidsRef.current[hit.index] : null;
    };
    let downAt: [number, number] | null = null;
    let lastHover = 0;
    const onDown = (e: PointerEvent) => (downAt = [e.clientX, e.clientY]);
    const onMove = (e: PointerEvent) => {
      if (e.buttons || performance.now() - lastHover < 50) return;
      lastHover = performance.now();
      const a = pick(e);
      setHovered(a);
      renderer.domElement.style.cursor = a ? "pointer" : "grab";
      if (a) anchors.set("hover", v3(positionAt(a.el, jdRef.current)));
    };
    const onUp = (e: PointerEvent) => {
      if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 4) return;
      const a = pick(e);
      if (a) return onPickRef.current(a);
      // Earth, when zoomed in on it: a hit on the globe, or within a finger's width of its centre.
      const earth = planets.find((p) => p.row.name === "Earth")!.body.mesh;
      if (!onEarthRef.current || camera.position.distanceTo(earth.position) > 0.3) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const onScreen = earth.position.clone().project(camera);
      const px = Math.hypot(((onScreen.x + 1) / 2) * rect.width + rect.left - e.clientX, ((1 - onScreen.y) / 2) * rect.height + rect.top - e.clientY);
      if (raycaster.intersectObject(earth).length || px < 16) onEarthRef.current(e.clientX, e.clientY);
    };
    const onLeave = () => setHovered(null);
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    const projected = new THREE.Vector3();
    const origin = new THREE.Vector3();
    const shift = new THREE.Vector3();
    let frame = 0;
    const tick = () => {
      const it = internals.current!;
      // Follow: carry the camera with the followed object, keeping the same viewing offset.
      // Back on the Sun, glide there instead of jumping.
      const followed = followRef.current ? anchors.get(followRef.current) : undefined;
      shift.subVectors(followed ?? origin, controls.target).multiplyScalar(followed ? 1 : 0.12);
      controls.target.add(shift);
      camera.position.add(shift);
      if (it.ease) {
        const t = Math.min(1, (performance.now() - it.ease.start) / EASE_MS);
        const d = it.ease.from * Math.pow(it.ease.to / it.ease.from, easeOut(t)); // log-space: smooth across scales
        camera.position.sub(controls.target).setLength(d).add(controls.target);
        if (t >= 1) it.ease = null;
      }
      controls.update();
      for (const { body } of it.planets) sizeBody(body, camera);
      sizeBody(it.moon, camera);
      for (const b of it.selectionBodies) sizeBody(b, camera);
      renderer.render(scene, camera);
      // Move the HTML marks (rings, letters, labels) onto their projected positions.
      const overlay = overlayRef.current;
      if (overlay) {
        const camDist = camera.position.distanceTo(controls.target);
        for (const node of Array.from(overlay.children) as HTMLElement[]) {
          const key = node.dataset.anchor ?? "";
          const anchor = anchors.get(key);
          if (!anchor) continue;
          projected.copy(anchor).project(camera);
          const px = ((projected.x + 1) / 2) * host.clientWidth;
          const py = ((1 - projected.y) / 2) * host.clientHeight;
          // Body labels stay off the frame edge and out from under the title; the Moon's only in close-ups.
          const isBody = key.startsWith("planet:") || key === "moon";
          const clear = !isBody || (px > 12 && px < host.clientWidth - 90 && py > 12 && !(px < 560 && py < 150));
          const inRange = key !== "moon" || camDist < 0.05;
          node.style.opacity = projected.z < 1 && clear && inRange ? "1" : "0";
          node.style.transform = `translate(${px}px, ${py}px)`;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    setReady((n) => n + 1);

    return () => {
      poseRef.current = { position: camera.position.clone(), target: controls.target.clone() };
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      root.removeChild(renderer.domElement);
      internals.current = null;
    };
    // The scene is rebuilt only when the theme changes; data, date and selection effects follow below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Re-apply the view offset when the sleeves open or close.
  useEffect(() => resizeRef.current(), [rightInset]);

  // Move planets, the Moon and asteroids to the plate's date.
  useEffect(() => {
    const it = internals.current;
    if (!it) return;
    for (const { body, row } of it.planets) {
      const p = v3(positionAt(planetElements(row, jd), jd));
      body.mesh.position.copy(p);
      it.anchors.set(`planet:${row.name}`, p);
    }
    const earth = positionAt(planetElements(PLANETS[2], jd), jd);
    const moonAt = v3(add3(earth, moonOffset(jd)));
    it.moon.mesh.position.copy(moonAt);
    it.moonOrbit.position.copy(v3(earth));
    it.anchors.set("moon", moonAt);
    const buf = new Float32Array(asteroids.length * 3);
    asteroids.forEach((a, k) => {
      const [x, y, z] = positionAt(a.el, jd);
      buf.set([x, z, -y], k * 3);
    });
    it.cloud.geometry.setAttribute("position", new THREE.BufferAttribute(buf, 3));
    it.cloud.geometry.computeBoundingSphere();
  }, [asteroids, jd, ready]);

  // Selected orbits, a dashed line from Earth to each asteroid, and a body you can see up close.
  useEffect(() => {
    const it = internals.current;
    if (!it) return;
    it.selectionGroup.clear();
    it.selectionBodies = [];
    const earth = v3(positionAt(planetElements(PLANETS[2], jd), jd));
    for (const s of selected) {
      const here = v3(positionAt(s.el, jd));
      it.selectionGroup.add(inkLine(orbitPath(s.el, 720).map(v3), theme.selectedOrbit, 2.2, false, it.resolution));
      it.selectionGroup.add(inkLine([earth, here], theme.selectedOrbit, 1.2, true, it.resolution, Math.max(0.00005, earth.distanceTo(here) / 60)));
      if (blinkFromJd != null) {
        // How far it jumps between the two blinked plates, traced along its orbit.
        const trail: THREE.Vector3[] = [];
        for (let k = 0; k <= 24; k++) trail.push(v3(positionAt(s.el, blinkFromJd + (blinkGapDays * k) / 24)));
        it.selectionGroup.add(inkLine(trail, theme.selectedOrbit, 3.2, true, it.resolution));
      }
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: theme.ring }));
      mesh.position.copy(here);
      it.selectionGroup.add(mesh);
      it.selectionBodies.push({ mesh, baseRadius: 0.004, realRadius: 2e-6 });
      it.anchors.set(`sel:${s.id}`, here);
    }
  }, [selected, jd, blinkFromJd, blinkGapDays, theme, ready]);

  // Ease out to frame every circled orbit when the selection grows (unless following something).
  const selectedKey = selected.map((s) => s.id).join("|");
  useEffect(() => {
    const it = internals.current;
    if (!it || selected.length === 0 || followRef.current) return;
    const reach = Math.max(1.05, ...selected.map((s) => s.el.a * (1 + s.el.e)));
    const host = hostRef.current!;
    const visibleAspect = Math.max(0.3, (host.clientWidth - Math.min(rightInset, host.clientWidth * 0.6)) / Math.max(1, host.clientHeight));
    const to = Math.min(it.controls.maxDistance, fitDistance(it.camera, reach, visibleAspect));
    it.ease = { from: it.camera.position.distanceTo(it.controls.target), to, start: performance.now() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  // Requested zooms: close-ups, or back out when returning to the Sun.
  useEffect(() => {
    const it = internals.current;
    if (!it || !zoom) return;
    it.ease = { from: it.camera.position.distanceTo(it.controls.target), to: zoom.distance, start: performance.now() };
  }, [zoom]);

  const label = (color: string) => ({ position: "absolute" as const, fontSize: 11, letterSpacing: "0.04em", color, whiteSpace: "nowrap" as const });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
      <div ref={overlayRef} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: TYPED }}>
        {PLANETS.map((p) => (
          <div key={p.name} data-anchor={`planet:${p.name}`} style={{ position: "absolute", left: 0, top: 0, willChange: "transform" }}>
            <span style={{ ...label(p.name === "Earth" ? theme.labelStrong : theme.label), left: 9, top: -7 }}>{p.name.toUpperCase()}</span>
          </div>
        ))}
        <div data-anchor="moon" style={{ position: "absolute", left: 0, top: 0, willChange: "transform", transition: "opacity 300ms" }}>
          <span style={{ ...label(theme.label), left: 8, top: -7 }}>MOON</span>
        </div>
        {selected.map((s) => (
          <div key={s.id} data-anchor={`sel:${s.id}`} style={{ position: "absolute", left: 0, top: 0, willChange: "transform" }}>
            <svg width="44" height="44" viewBox="-22 -22 44 44" style={{ position: "absolute", left: -22, top: -22, overflow: "visible" }}>
              <circle r="15" fill="none" stroke={theme.ring} strokeWidth="1.8" />
            </svg>
            <span style={{ position: "absolute", left: 19, top: -26, fontSize: 13, fontWeight: 700, color: theme.ring }}>{s.mark}</span>
            <span style={{ position: "absolute", left: 19, top: 10, fontSize: 12, color: theme.labelStrong, whiteSpace: "nowrap", background: theme.labelWash, padding: "0 3px" }}>{s.name}</span>
          </div>
        ))}
        {hovered && !selected.some((s) => s.id === hovered.id) && (
          <div data-anchor="hover" style={{ position: "absolute", left: 0, top: 0, willChange: "transform" }}>
            <svg width="30" height="30" viewBox="-15 -15 30 30" style={{ position: "absolute", left: -15, top: -15, overflow: "visible" }}>
              <circle r="10" fill="none" stroke={theme.label} strokeWidth="1.2" strokeDasharray="3 3" />
            </svg>
            <span style={{ position: "absolute", left: 14, top: -8, fontSize: 12, color: theme.label, whiteSpace: "nowrap", background: theme.labelWash, padding: "0 3px" }}>{hovered.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
