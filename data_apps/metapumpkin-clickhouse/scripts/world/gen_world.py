#!/usr/bin/env python3
"""
The World tab's map: generates src/pages/world/geo.ts (layout, terrain and roads), src/pages/world/art.ts (sprites)
and src/fixtures/world.ts (the static preview's view model).

    pip install shapely        # once
    python3 scripts/world/gen_world.py

The map is a custom one, not to scale. The land is cut from real coastlines (Natural Earth 1:50m, downloaded once
into scripts/world/.cache/) in Mercator, the shapes people know from a world map, in four pieces: North America,
Britain and Ireland, the rest of Europe, and Japan. Each piece has its own lens, strong around a hub and small at
its far coasts, and its own place: Britain beside the continent, the three regions side by side, close together.
A hub is a fenced yard inside a ring road; its cities sit in their real direction from it, at a distance that
follows the drive time, each road ending at a plaza with the city's icon (its landmark, or a pumpkin fountain) and
its four stores fanned out beyond it. Ground is grown under anything that would fall in the sea, rounded so it
reads as coast. Every place is keyed by the pumpkin_live ids: hub_id, city_key and store_id (numbered as
supabase/pumpkin_live/01_master.sql numbers them: by country, city and store order).

The run checks the layout (every shop, barn, field, plaza and label on land and clear of the coast and of the
other hubs) and writes nothing if it fails; WORLD_STRICT=0 writes anyway and only lists the problems.
Random scenery (trees, hills, lakes, boats) is seeded, so a rerun gives the same map.
"""
import datetime, hashlib, json, math, os, random, re

HERE = os.path.dirname(os.path.abspath(__file__))

# ------------------------------------------------------------------ the world (supabase/pumpkin_live/01_master.sql)
COUNTRIES = [
    # cc, name, region, utc offset, tz label, close hour, island centre, hub
    ("US", "United States", "NA", -4, "EDT", 21, (330, 570), ("US-lancaster", "Lancaster hub", 40.0379, -76.3055, "Isuzu NPR-HD")),
    ("CA", "Canada", "NA", -4, "EDT", 21, (250, 212), ("CA-guelph", "Guelph hub", 43.5448, -80.2482, "Isuzu NPR-HD")),
    ("GB", "United Kingdom", "EU", 1, "BST", 20, (655, 222), ("GB-bedford", "Bedford hub", 52.1364, -0.4667, "Mercedes Atego 818")),
    ("DE", "Germany", "EU", 2, "CEST", 20, (745, 580), ("DE-brandenburg", "Brandenburg hub", 52.4125, 12.5316, "Mercedes Atego 818")),
    ("JP", "Japan", "APAC", 9, "JST", 21, (1090, 360), ("JP-chiba", "Chiba hub", 35.6073, 140.1063, "Isuzu Elf")),
]
CITIES = [
 ('US','Philadelphia',39.9526,-75.1652,105, 85,'US-30'),('US','New York',40.7128,-74.0060,260,195,'I-78'),
 ('US','Baltimore',39.2904,-76.6122,120, 90,'I-83'),('US','Washington',38.9072,-77.0369,190,150,'I-95'),
 ('US','Pittsburgh',40.4406,-79.9959,360,225,'I-76'),
 ('CA','Toronto',43.6532,-79.3832, 95, 80,'Hwy 401'),('CA','Hamilton',43.2557,-79.8711, 50, 45,'Hwy 6'),
 ('CA','Ottawa',45.4215,-75.6972,490,300,'Hwy 401'),('CA','London',42.9849,-81.2453,105, 70,'Hwy 401'),
 ('CA','Kingston',44.2312,-76.4860,345,220,'Hwy 401'),
 ('GB','London',51.5074,-0.1278,  90,100,'the M1'),('GB','Bristol',51.4545,-2.5879, 210,150,'the M4'),
 ('GB','Manchester',53.4808,-2.2426, 245,180,'the M6'),('GB','Birmingham',52.4862,-1.8904, 135,105,'the M6'),
 ('GB','Leeds',53.8008,-1.5491, 245,170,'the M1'),
 ('DE','Berlin',52.5200,13.4050,  75, 65,'the A10'),('DE','Hamburg',53.5511, 9.9937, 300,195,'the A24'),
 ('DE','Leipzig',51.3397,12.3731, 170,115,'the A9'),('DE','Dresden',51.0504,13.7373, 230,150,'the A13'),
 ('DE','Hannover',52.3759, 9.7320, 240,155,'the A2'),
 ('JP','Tokyo',35.6762,139.6503, 45, 75,'the Keiyo Road'),('JP','Yokohama',35.4437,139.6380, 60, 80,'the Bayshore Route'),
 ('JP','Saitama',35.8617,139.6455, 65, 90,'the Gaikan Expressway'),('JP','Kawasaki',35.5308,139.7029, 55, 75,'the Bayshore Route'),
 ('JP','Kashiwa',35.8676,139.9759, 40, 60,'Route 16'),
]
STORES = {
 ('US','Philadelphia'):['Fishtown:F','Old City:S','Manayunk:S','Germantown:E'],
 ('US','New York'):['Astoria:F','Park Slope:S','Harlem:S','Chelsea:E'],
 ('US','Baltimore'):['Fells Point:S','Canton:S','Hampden:E','Mount Vernon:F'],
 ('US','Washington'):['Georgetown:F','Capitol Hill:S','Adams Morgan:E','Navy Yard:S'],
 ('US','Pittsburgh'):['Lawrenceville:S','Shadyside:F','Squirrel Hill:S','South Side:E'],
 ('CA','Toronto'):['Leslieville:S','The Annex:F','Liberty Village:S','Danforth:E'],
 ('CA','Hamilton'):['Westdale:S','Locke Street:E','Stoney Creek:S','Ancaster:F'],
 ('CA','Ottawa'):['Glebe:F','ByWard Market:S','Westboro:S','Kanata:E'],
 ('CA','London'):['Wortley Village:S','Old North:E','Byron:S','Masonville:F'],
 ('CA','Kingston'):['Sydenham:S','Portsmouth:E','Cataraqui:F','Williamsville:S'],
 ('GB','London'):['Camden:F','Islington:S','Brixton:S','Greenwich:E'],
 ('GB','Bristol'):['Clifton:F','Bedminster:S','Stokes Croft:E','Redland:S'],
 ('GB','Manchester'):['Ancoats:S','Didsbury:F','Chorlton:S','Salford Quays:E'],
 ('GB','Birmingham'):['Digbeth:E','Moseley:S','Edgbaston:F','Jewellery Quarter:S'],
 ('GB','Leeds'):['Headingley:S','Chapel Allerton:F','Kirkstall:E','Roundhay:S'],
 ('DE','Berlin'):['Kreuzberg:F','Prenzlauer Berg:S','Neukölln:S','Charlottenburg:E'],
 ('DE','Hamburg'):['Altona:F','Eimsbüttel:S','St. Georg:E','Winterhude:S'],
 ('DE','Leipzig'):['Plagwitz:S','Connewitz:E','Gohlis:F','Südvorstadt:S'],
 ('DE','Dresden'):['Neustadt:F','Blasewitz:S','Striesen:E','Pieschen:S'],
 ('DE','Hannover'):['Linden:S','List:F','Südstadt:S','Herrenhausen:E'],
 ('JP','Tokyo'):['Shimokitazawa:S','Nakameguro:F','Kichijoji:S','Yanaka:E'],
 ('JP','Yokohama'):['Motomachi:F','Minato Mirai:S','Kannai:E','Aobadai:S'],
 ('JP','Saitama'):['Omiya:F','Urawa:S','Iwatsuki:E','Minami-Urawa:S'],
 ('JP','Kawasaki'):['Musashi-Kosugi:F','Mizonokuchi:S','Shin-Yurigaoka:S','Kawasaki Station:E'],
 ('JP','Kashiwa'):['Kashiwanoha:F','Minami-Kashiwa:S','Kita-Kashiwa:E','Kashiwa Station:S'],
}
FIELDS = [(1,'Carving','Aug 26','Oct 21'),(2,'Carving','Sep 12','Oct 31'),(3,'Carving','Sep 27','Oct 31'),
          (4,'Cooking','Aug 26','Oct 24'),(5,'Cooking','Sep 18','Oct 31'),(6,'Mini','Aug 27','Oct 31')]

# the static preview's van mix per hub (src/fixtures/world.ts), shaped by each country's local time
MIX = {
 "US": dict(hub=3, loading=3, driving=7, stopped=1, unloading=2, returning=3, workshop=1),
 "CA": dict(hub=2, loading=2, driving=6, stopped=1, unloading=2, returning=5, workshop=2),
 "GB": dict(hub=9, loading=0, driving=1, stopped=0, unloading=1, returning=8, workshop=1),
 "DE": dict(hub=15, loading=0, driving=0, stopped=0, unloading=0, returning=3, workshop=2),
 "JP": dict(hub=16, loading=3, driving=0, stopped=0, unloading=0, returning=0, workshop=1),
}
WS_REASON = ["Scheduled service", "Brake pads", "Tyre change", "Repair after breakdown · cooling fan", "Scheduled service"]


def h01(key):
    return int(hashlib.md5(key.encode()).hexdigest()[:8], 16) / 0xFFFFFFFF

# ------------------------------------------------------------------ projection
# The land is drawn in Mercator (the shapes people know from a world map), K plane px per degree, in four pieces:
# North America, Britain and Ireland, the rest of Europe, and Japan. Each piece has its own lens, M times near its
# centre (where a hub's roads, cities and stores need room) easing smoothly to m1 times far from it, so its far coasts
# take little room (squeezed toward the hub); and its own place on the plane (AT, laid out below).
K = 28.0

def merc(lat):
    return math.degrees(math.log(math.tan(math.radians(45 + lat / 2))))

def unmerc(y):
    return math.degrees(2 * math.atan(math.exp(math.radians(y)))) - 90

LENS = {
    #      centre (lon, lat)  M    r0   m1
    "NA": ((-84.0, 44.5), 3.0, 8.0, 0.55),
    "GB": ((-1.8, 52.9), 5.6, 3.0, 1.0),
    "EU": ((10.5, 51.0), 3.5, 4.5, 0.8),
    "JP": ((139.6, 36.2), 7.0, 2.0, 1.0),
}
AT = {k: (0.0, 0.0) for k in LENS}

def lens_r(r, M, r0, m1):
    return m1 * r + (M - m1) * r0 * math.tanh(r / r0)

def lens_r_inv(f, M, r0, m1):
    lo, hi = 0.0, f / m1 + 1
    for _ in range(40):
        mid = (lo + hi) / 2
        if lens_r(mid, M, r0, m1) < f: lo = mid
        else: hi = mid
    return (lo + hi) / 2

def P(lon, lat, piece=None):
    piece = piece or piece_of(lon, lat)
    (clon, clat), M, r0, m1 = LENS[piece]
    dx, dy = lon - clon, merc(clat) - merc(lat)
    r = math.hypot(dx, dy)
    s = lens_r(r, M, r0, m1) / r if r > 1e-9 else M
    ax, ay = AT[piece]
    return ax + dx * s * K, ay + dy * s * K

def to_lonlat(x, y):
    piece = piece_at(x, y)
    (clon, clat), M, r0, m1 = LENS[piece]
    ax, ay = AT[piece]
    dx, dy = (x - ax) / K, (y - ay) / K
    f = math.hypot(dx, dy)
    s = lens_r_inv(f, M, r0, m1) / f if f > 1e-9 else 1 / M
    return clon + dx * s, unmerc(merc(clat) - dy * s)

def px_per_deg(lon, lat):
    """The plane px one degree of longitude takes here."""
    (x0, y0), (x1, y1) = P(lon - 0.25, lat), P(lon + 0.25, lat)
    return math.hypot(x1 - x0, y1 - y0) / 0.5

# ------------------------------------------------------------------ geometry
# Natural Earth 1:50m countries (world-atlas topojson), downloaded once into scripts/world/.cache/
TOPO = os.path.join(HERE, ".cache", "countries-50m.json")
if not os.path.exists(TOPO):
    import urllib.request
    os.makedirs(os.path.dirname(TOPO), exist_ok=True)
    urllib.request.urlretrieve("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json", TOPO)
topo = json.load(open(TOPO))
sc, tr = topo["transform"]["scale"], topo["transform"]["translate"]
ARCS = []
for arc in topo["arcs"]:
    x = y = 0; pts = []
    for dx, dy in arc:
        x += dx; y += dy
        pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
    ARCS.append(pts)

def ring(idxs):
    pts = []
    for i in idxs:
        a = ARCS[i] if i >= 0 else ARCS[~i][::-1]
        pts.extend(a if not pts else a[1:])
    return pts

def polys(g):
    if g["type"] == "Polygon":
        return [[ring(r) for r in g["arcs"]]]
    if g["type"] == "MultiPolygon":
        return [[ring(r) for r in p] for p in g["arcs"]]
    if g["type"] == "GeometryCollection":
        return [p for x in g["geometries"] for p in polys(x)]
    return []

def dp(pts, tol):
    if len(pts) < 4: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax_, ay_ = pts[a]; bx_, by_ = pts[b]
        dx, dy = bx_ - ax_, by_ - ay_; L = math.hypot(dx, dy) or 1e-9
        best, bi = -1, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * (px - ax_) - dx * (py - ay_)) / L
            if d > best: best, bi = d, i
        if best > tol:
            keep[bi] = True; stack.append((a, bi)); stack.append((bi, b))
    return [p for p, k in zip(pts, keep) if k]

def dp_ring(pts, tol):
    if len(pts) < 4: return pts
    x0, y0 = pts[0]
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - x0) ** 2 + (pts[i][1] - y0) ** 2)
    a = dp(pts[:far + 1], tol); b = dp(pts[far:], tol)
    return a[:-1] + b

def area(pts):
    return abs(sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts)))) / 2

def densify(r, maxdeg=0.5):
    out = [r[0]]
    for (x0, y0), (x1, y1) in zip(r, r[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) / maxdeg)
        for k in range(1, n + 1):
            out.append((x0 + (x1 - x0) * k / (n + 1), y0 + (y1 - y0) * k / (n + 1)))
        out.append((x1, y1))
    return out

def project_rings(geoms, tol, min_area, fn=P):
    rings = []
    for poly in geoms:
        lats = [p[1] for p in poly[0]]
        if sum(lats) / len(lats) < -58: continue
        for r in poly:
            pr = [fn(lon, lat) for lon, lat in densify(r)]
            s = dp_ring(pr, tol)
            if len(s) >= 4 and area(s) >= min_area:
                rings.append(s)
    return rings

def path_d(rings, nd=1):
    return "".join("M" + "L".join(f"{x:.{nd}f} {y:.{nd}f}" for x, y in r) + "Z" for r in rings)

GEOMS = topo["objects"]["countries"]["geometries"]
from shapely.geometry import Point, Polygon, box
from shapely.ops import unary_union

def shapes(ids=None, skip=()):
    out = []
    for g in GEOMS:
        if ids is not None and g.get("id") not in ids: continue
        if g.get("id") in skip: continue
        for poly in polys(g):
            try:
                out.append(Polygon(poly[0], poly[1:]).buffer(0))
            except Exception:
                pass
    return unary_union(out)

def blob(cx, cy, rx, ry, seed, amp=0.11, n=240):
    ph = [h01(f"{seed}{i}") * 6.283 for i in range(4)]
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        r = 1 + amp * (0.5 * math.sin(3 * a + ph[0]) + 0.3 * math.sin(5 * a + ph[1]) + 0.2 * math.sin(8 * a + ph[2]) + 0.12 * math.sin(13 * a + ph[3]))
        pts.append((cx + rx * r * math.cos(a), cy + ry * r * math.sin(a)))
    return Polygon(pts)

def as_polys(geom):
    gs = [geom] if geom.geom_type == "Polygon" else list(getattr(geom, "geoms", []))
    return [[list(g.exterior.coords)] + [list(i.coords) for i in g.interiors] for g in gs if g.geom_type == "Polygon" and not g.is_empty]

NO = {"504", "012", "788", "434", "818", "304", "352", "234"}   # North Africa, Greenland, Iceland, the Faroes
# the United Kingdom, Ireland, the Isle of Man and the Channel Islands (Britain's piece); Japan
UKI, JPN = {"826", "372", "833", "831", "832"}, {"392"}
WORLD = shapes(skip=NO)
PIECE_GEOM = {
    "NA": WORLD.intersection(blob(-95, 40.5, 42, 23.5, "na")),
    "GB": shapes(ids=UKI).intersection(box(-11, 49.0, 2.5, 61)),
    "EU": shapes(skip=NO | UKI).intersection(blob(8, 48, 24, 16, "eu")),
    "JP": shapes(ids=JPN).intersection(box(129, 30.8, 146.5, 46)),
}
_piece_cache = {}
def piece_of(lon, lat):
    key = (round(lon, 4), round(lat, 4))
    if key not in _piece_cache:
        pt = Point(lon, lat)
        _piece_cache[key] = min(PIECE_GEOM, key=lambda k: PIECE_GEOM[k].distance(pt))
    return _piece_cache[key]

def piece_polys(piece, tol=0.9, min_area=10):
    rings = project_rings(as_polys(PIECE_GEOM[piece]), tol, min_area, fn=lambda lon, lat: P(lon, lat, piece))
    return unary_union([Polygon(r).buffer(0) for r in rings])

# ------------------------------------------------------------------ clusters
YS = 1.12   # a city ring spreads a little more north-south than east-west

def bearing(lat0, lon0, lat1, lon1):
    return math.degrees(math.atan2(-(lat1 - lat0), (lon1 - lon0) * math.cos(math.radians(lat0))))

def spread(angles, sep):
    a = list(angles)
    for _ in range(300):
        moved = False
        for i in range(len(a)):
            for j in range(len(a)):
                if i == j: continue
                d = (a[j] - a[i] + 180) % 360 - 180
                if abs(d) < sep:
                    push = (sep - abs(d)) / 2 + 0.5
                    a[i] -= push * (1 if d > 0 else -1); a[j] += push * (1 if d > 0 else -1); moved = True
        if not moved: break
    return a

def gaps(angles):
    s = sorted(x % 360 for x in angles)
    out = []
    for i in range(len(s)):
        a, b = s[i], s[(i + 1) % len(s)] + (360 if i == len(s) - 1 else 0)
        out.append((b - a, (a + (b - a) / 2) % 360))
    return sorted(out, reverse=True)

# A hub is a fenced yard (barn, silo, a parking lot of 20 bays) inside a ring road; every city road leaves from the
# ring, so vans never drive across the barn or the lot. The workshop and the fields sit outside the ring.
RING = 128          # the ring road's centre line, from the yard's centre
ROAD_W = 26         # a road's width: two lanes of trucks (model.ts LANE), side by side
YARD = 114          # the yard's fence
LANDMARK_OF = {("US", "New York"): ("liberty", "Statue of Liberty"), ("US", "Washington"): ("capitol", "Capitol"),
               ("CA", "Toronto"): ("cntower", "CN Tower"), ("GB", "London"): ("bigben", "Big Ben"),
               ("DE", "Berlin"): ("brandenburg", "Brandenburg Gate"), ("JP", "Tokyo"): ("tokyotower", "Tokyo Tower"),
               ("US", "Philadelphia"): ("libertybell", "Liberty Bell"), ("CA", "Ottawa"): ("parliament", "Parliament")}
from shapely.geometry import LineString
from shapely.affinity import translate

def build_clusters():
    """Lays out every hub's yard, cities, stores, fields and vans around its anchor (P(ANCHOR) on its piece), and
    the ground they need (fp, per country). Run once to measure the clusters for the layout, then on the final map."""
    global islands, hubs, cities, stores, fields, trucks, cluster_pts, road_paths, store_id, landmarks, fp, hub_xy
    islands, hubs, cities, stores, fields, trucks = [], [], [], [], [], []
    cluster_pts = []
    road_paths = []
    store_id = 0
    for ci_, (cc, cname, region, off, tzl, close, _ic, hub) in enumerate(COUNTRIES):
        hub_id, hub_name, hlat, hlon, model = hub
        ax_, ay_ = P(*ANCHOR[cc], HOME[cc])
        cs = [c for c in CITIES if c[0] == cc]
        angs = spread([bearing(hlat, hlon, c[2], c[3]) for c in cs], 56)
        city_angles = []
        for c, a in zip(cs, angs):
            r = 262 + 118 * (c[5] - 45) / 255
            x = ax_ + r * math.cos(math.radians(a)); y = ay_ + r * math.sin(math.radians(a)) * YS
            sx, sy = ax_ + RING * math.cos(math.radians(a)), ay_ + RING * math.sin(math.radians(a))
            mx, my = (sx + x) / 2, (sy + y) / 2
            nx, ny = -(y - sy), (x - sx); ln = math.hypot(nx, ny) or 1
            bend = 14 if h01("bend" + cc + c[1]) > 0.5 else -14
            qx, qy = mx + nx / ln * bend, my + ny / ln * bend
            cidx = len(cities)
            # the road ends at the city's plaza; the shops fan out beyond it, each on a driveway
            ux, uy = x - qx, y - qy; ul = math.hypot(ux, uy) or 1; ux, uy = ux / ul, uy / ul
            RS = 104          # the stores' distance from the city's plaza
            fan = []
            for ang in (-64, -21, 21, 64):
                ca, sa = math.cos(math.radians(ang)), math.sin(math.radians(ang))
                fan.append((ux * ca - uy * sa, ux * sa + uy * ca))
            lab_d = RS + (66 if uy < -0.3 else 52)
            cities.append(dict(id=f"{cc}-{c[1]}", name=c[1], cc=cc, x=round(x, 1), y=round(y, 1), qx=round(qx, 1), qy=round(qy, 1), sx=round(sx, 1), sy=round(sy, 1),
                               ux=round(ux, 3), uy=round(uy, 3), lx=round(x + ux * lab_d, 1), ly=round(y + uy * lab_d + (16 if abs(uy) < 0.6 else 0), 1),
                               km=c[4], drive=c[5], road=c[6], stores=[]))
            road_paths.append((cc, f"M{sx:.1f} {sy:.1f}Q{qx:.1f} {qy:.1f} {x:.1f} {y:.1f}"))
            city_angles.append(a)
            cluster_pts.append((x + ux * 52, y + uy * 52, 104))
            for k, item in enumerate(STORES[(cc, c[1])]):
                nm, f_ = item.split(":")
                fmt = {"F": "Flagship", "S": "Standard", "E": "Express"}[f_]
                roll = h01("lvl" + nm + cc)
                if roll < 0.70: lvl = 0.42 + 0.55 * h01("a" + nm)
                elif roll < 0.92: lvl = 0.12 + 0.2 * h01("b" + nm)
                else: lvl = 0.02 * h01("c" + nm)
                ox, oy = fan[k][0] * RS, fan[k][1] * RS
                store_id += 1
                stores.append(dict(id=store_id, name=nm, fmt=fmt, city=cidx, cc=cc, k=k, lvl=round(lvl, 3),
                                   rate=round((1.6 + 1.4 * h01("r" + nm)) * 1e-5, 8), x=round(x + ox, 1), y=round(y + oy, 1)))
                cities[cidx]["stores"].append(len(stores) - 1)
        g = gaps(city_angles)
        fa = g[0][1]
        g2 = gaps(city_angles + [fa])
        wa = g2[0][1]
        wx, wy = ax_ + (RING + 74) * math.cos(math.radians(wa)), ay_ + (RING + 74) * math.sin(math.radians(wa))
        fcx, fcy = ax_ + (RING + 122) * math.cos(math.radians(fa)), ay_ + (RING + 122) * math.sin(math.radians(fa))
        # the yard: barn at the back, the lot in front with two rows of ten bays (vans park nose up)
        bays = [(round(ax_ - 72 + col * 16, 1), round(ay_ + (30 if row == 0 else 62), 1)) for row in (0, 1) for col in range(10)]
        hubs.append(dict(id=cc, name=hub_name, cc=cc, x=round(ax_, 1), y=round(ay_, 1), wx=round(wx, 1), wy=round(wy, 1),
                         barn=(round(ax_ - 26, 1), round(ay_ + 6, 1)), bays=bays, label=(round(ax_, 1), round(ay_ + RING + 34, 1)),
                         wbays=[(round(wx - 34 + i * 34, 1), round(wy + 24, 1)) for i in range(3)],
                         wa=wa, fa=fa, model=model, stock=int(900 + h01("stock" + cc) * 700)))
        cluster_pts += [(ax_, ay_, RING + 34), (wx, wy, 52), (fcx, fcy + 10, 82)]
        hubs[-1]["fbox"] = [round(fcx - 49, 1), round(fcy - 23, 1), round(fcx + 49, 1), round(fcy + 43, 1)]
        for (no, variety, d1, d2), (gx, gy) in zip(FIELDS, [(-1, -1), (0, -1), (1, -1), (-1, 0), (0, 0), (1, 0)]):
            fx, fy = fcx + gx * 31 + 0, fcy + gy * 21 + 10
            fields.append(dict(id=f"{cc}-f{no}", no=no, variety=variety, d1=d1, d2=d2, cc=cc, x=round(fx, 1), y=round(fy, 1),
                               plan={"Carving": 34, "Cooking": 22, "Mini": 9}[variety] + int(h01("plan" + cc + str(no)) * 8)))
        islands.append(dict(cc=cc, name=cname, region=region, off=off, tz=tzl, close=close, hub=hub_name,
                            nx=round(ax_, 1), ny=round(ay_, 1)))
        mix = MIX[cc]
        seq = []
        for st in ["driving", "stopped", "unloading", "returning", "loading", "hub", "workshop"]:
            seq += [st] * mix[st]
        hub_stores = [i for i, s in enumerate(stores) if s["cc"] == cc]
        for n, st in enumerate(seq):
            fleet = (ci_ + 1) * 100 + n + 1
            tgt = hub_stores[(n * 7 + 3) % len(hub_stores)]
            tr_ = dict(id=fleet, cc=cc, status=st, store=tgt, frac=round(0.12 + 0.76 * h01("frac" + str(fleet)), 3), bins=6 + int(h01("bins" + str(fleet)) * 3))
            if st == "loading": tr_["timer"] = int(600 + h01("t" + str(fleet)) * 1800)
            elif st == "unloading": tr_["timer"] = int(300 + h01("t" + str(fleet)) * 1200); tr_["frac"] = 1
            elif st == "stopped": tr_["timer"] = 1500
            elif st == "hub": tr_["timer"] = int(900 + h01("t" + str(fleet)) * 3600)
            elif st == "workshop": tr_["reason"] = WS_REASON[(fleet * 3) % len(WS_REASON)]
            else: tr_["timer"] = 0
            if st in ("hub", "workshop"): tr_["frac"] = 0
            trucks.append(tr_)
    for t in trucks:
        if t["id"] == 107:
            t["status"] = "driving"; t["frac"] = 0.46
            t["store"] = next(i for i, s in enumerate(stores) if s["name"] == "Harlem")
            t["plate"] = "PA KZD-4471"

    landmarks = []
    for ci, c in enumerate(cities):
        # every city's plaza has its icon in the middle: its landmark, or a pumpkin fountain
        lm = LANDMARK_OF.get((c["cc"], c["name"]), ("fountain", "Town square"))
        hx_ = next(h["x"] for h in hubs if h["cc"] == c["cc"])
        side = 1 if c["x"] >= hx_ else -1
        ca, sa = math.cos(math.radians(side * 112)), math.sin(math.radians(side * 112))
        dx_, dy_ = c["ux"] * ca - c["uy"] * sa, c["ux"] * sa + c["uy"] * ca
        landmarks.append(dict(kind=lm[0], name=lm[1], city=ci, x=round(c["x"], 1), y=round(c["y"] + 14, 1)))

    # the ground each cluster needs: its yard, workshop, fields, roads, plazas, stores and labels
    fp = {cc: [] for cc in HOME}
    hub_xy = {h["cc"]: (h["x"], h["y"]) for h in hubs}
    for h in hubs:
        fp[h["cc"]] += [Point(h["x"], h["y"]).buffer(RING + 46), Point(h["wx"], h["wy"]).buffer(74),
                        LineString([(h["x"], h["y"]), (h["wx"], h["wy"])]).buffer(30)]
        fx0, fy0, fx1, fy1 = h["fbox"]
        fp[h["cc"]] += [Point((fx0 + fx1) / 2, (fy0 + fy1) / 2).buffer(86), LineString([(h["x"], h["y"]), ((fx0 + fx1) / 2, (fy0 + fy1) / 2)]).buffer(26)]
    for f_ in fields:
        fp[f_["cc"]].append(Point(f_["x"], f_["y"]).buffer(36))
    for c in cities:
        fp[c["cc"]].append(Point(c["x"] + c["ux"] * 60, c["y"] + c["uy"] * 60).buffer(142))
        fp[c["cc"]].append(Point(c["lx"], c["ly"]).buffer(46))
        lw = (0.56 * 16 * len(c["name"]) + 1.3 * 16) / 2 + 10     # the label's pill at a mid zoom (16px), with a margin
        fp[c["cc"]].append(box(c["lx"] - lw, c["ly"] - 1.45 * 16 - 10, c["lx"] + lw, c["ly"] + 10))
        fp[c["cc"]] += [Point(stores[si]["x"], stores[si]["y"] - 10).buffer(52) for si in c["stores"]]
        fp[c["cc"]].append(LineString([(c["sx"], c["sy"]), (c["qx"], c["qy"]), (c["x"], c["y"])]).buffer(44))
    for lm in landmarks:
        fp[cities[lm["city"]]["cc"]].append(Point(lm["x"], lm["y"]).buffer(46))

# Layout. A cluster only depends on where its anchor lands, so a first build_clusters() measures the ground each
# hub needs; the pieces are then placed with it: Britain beside the continent across a narrow channel, and the three
# regions side by side, slid together until GAP px apart.
ANCHOR = {"US": (-89.5, 39.3), "CA": (-76.5, 50.3), "GB": (-1.3, 53.3), "DE": (11.2, 51.2), "JP": (139.6, 36.3)}
HOME = {"US": "NA", "CA": "NA", "GB": "GB", "DE": "EU", "JP": "JP"}
CHANNEL, GAP = 90, 300
CLUSTER = 500       # how far past a piece's coast piece_at() still counts a point as that piece's
CLOSE = 120         # the rounding of a cluster's ground (see the ground below)
MXL, MXR, MYT, MYB = 1400, 1400, 1700, 900

build_clusters()
FOOT = {}           # each country's cluster ground, relative to its anchor
for cc in HOME:
    ax, ay = P(*ANCHOR[cc], HOME[cc])
    FOOT[cc] = translate(unary_union(fp[cc]).buffer(CLOSE).buffer(-CLOSE), -ax, -ay)
# each piece's land and cluster ground with its lens centre at the origin; placed() moves it to AT
SHAPE0 = {}
for piece in LENS:
    AT[piece] = (0.0, 0.0)
    SHAPE0[piece] = unary_union([piece_polys(piece, 2.0, 40)] + [translate(FOOT[cc], *P(*ANCHOR[cc], piece)) for cc in HOME if HOME[cc] == piece])
def placed(piece):
    return translate(SHAPE0[piece], *AT[piece])

def push_apart(piece, other, gap, turn=0.0):
    """Moves `piece` from where it would sit in `other`'s lens away from `other` (turned `turn` degrees clockwise on screen,
    negative toward the north for a piece to the west) until they keep `gap` px apart."""
    base_ = placed(other)
    ox, oy = AT[other]
    nx, ny = P(*LENS[piece][0], other)
    a = math.atan2(ny - oy, nx - ox) + math.radians(turn)
    ux, uy = math.cos(a), math.sin(a)
    t = 0.0
    while True:
        AT[piece] = (nx + ux * t, ny + uy * t)
        if placed(piece).distance(base_) >= gap: return
        t += 10

push_apart("GB", "EU", CHANNEL, turn=32)
GROUPS = [["NA"], ["GB", "EU"], ["JP"]]
so_far, cy0 = None, None
for g in GROUPS:
    shape = unary_union([placed(p) for p in g])
    b_ = shape.bounds
    if so_far is None:
        so_far, cy0 = shape, (b_[1] + b_[3]) / 2
        continue
    dy = cy0 - (b_[1] + b_[3]) / 2
    dx = so_far.bounds[2] + GAP - b_[0]
    while translate(shape, dx - 10, dy).distance(so_far) >= GAP: dx -= 10
    for p in g: AT[p] = (AT[p][0] + dx, AT[p][1] + dy)
    so_far = unary_union([so_far, translate(shape, dx, dy)])
allb = so_far.bounds
for p in AT: AT[p] = (AT[p][0] - allb[0] + MXL, AT[p][1] - allb[1] + MYT)
W = int(allb[2] - allb[0] + MXL + MXR)
H = int(allb[3] - allb[1] + MYT + MYB)
PIECE_LAND = {p: piece_polys(p) for p in LENS}
# land on a piece that keeps a strait to the hub's ground: the island of Ireland (Northern Ireland too) stays an island
# beside Britain, moved a little west of where the lens puts it so Britain's west coast keeps its room
STRAIT, IRL_SHIFT = 70, 60
_IE = shapes(ids={"372"})
IRELAND = unary_union([_IE] + [g for g in getattr(shapes(ids={"826"}), "geoms", []) if g.distance(_IE) < 1e-6])
_irl = unary_union([Polygon(r).buffer(0) for r in project_rings(as_polys(IRELAND), 0.9, 10, fn=lambda lon, lat: P(lon, lat, "GB"))])
PIECE_LAND_APART = {"GB": (_irl, translate(_irl, -IRL_SHIFT, 0))}
PIECE_BOX = {p: PIECE_LAND[p].buffer(CLUSTER).bounds for p in LENS}
from shapely.prepared import prep
_piece_prep = {p: prep(PIECE_LAND[p].buffer(CLUSTER)) for p in LENS}
def piece_at(x, y):
    hits = [p for p, (x0, y0, x1, y1) in PIECE_BOX.items() if x0 <= x <= x1 and y0 <= y <= y1]
    if len(hits) == 1: return hits[0]
    pt = Point(x, y)
    inside = [p for p in hits if _piece_prep[p].contains(pt)]
    pool = inside or hits or list(LENS)
    return min(pool, key=lambda p: PIECE_LAND[p].distance(pt))
LAND = [r for p in LENS for r in project_rings(as_polys(PIECE_GEOM[p]), 0.9, 10, fn=lambda lon, lat, p=p: P(lon, lat, p))]

# point in land
RING_BB = [(min(p[0] for p in r), min(p[1] for p in r), max(p[0] for p in r), max(p[1] for p in r), r) for r in LAND]
def on_land(x, y):
    inside = False
    for x0, y0, x1, y1, r in RING_BB:
        if x < x0 or x > x1 or y < y0 or y > y1: continue
        j = len(r) - 1
        for i in range(len(r)):
            xi, yi = r[i]; xj, yj = r[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi:
                inside = not inside
            j = i
    return inside

# the clusters on the final map
build_clusters()

# ground under every cluster: the real coast plus the ground the cluster needs, rounded and joined to the coast (on
# each piece alone, so Britain and Japan stay islands) so grown ground reads like coast
parts, grown_area, part_of = [], 0.0, {}
for piece in LENS:
    feet = [g for cc in HOME if HOME[cc] == piece for g in fp[cc]]
    real = PIECE_LAND[piece]
    lensed, apart = PIECE_LAND_APART.get(piece, (None, None))
    if apart is not None: real = real.difference(lensed)
    if not feet:
        parts.append(real); part_of[piece] = real; continue
    # the cluster's own ground rounded into one mass, then joined to the coast, slivers of sea between them filled
    foot = unary_union(feet).buffer(CLOSE).buffer(-CLOSE)
    part = unary_union([real, foot]).buffer(40).buffer(-40)
    part = unary_union([real, part.intersection(foot.buffer(60))]).buffer(0)
    part = unary_union([Polygon(g.exterior, [i for i in g.interiors if Polygon(i).area > 9000]) for g in getattr(part, "geoms", [part])])
    if apart is not None: part = unary_union([part.difference(apart.buffer(STRAIT)), apart])
    grown_area += part.difference(real).area
    parts.append(part); part_of[piece] = part
land2 = unary_union(parts).buffer(0)
print("grown share", round(grown_area / land2.area, 3), "W", W, "H", H)
land_geom = unary_union(list(PIECE_LAND.values()))
lb = land2.bounds
FIT = dict(cx=round((lb[0] + lb[2]) / 2, 1), cy=round((lb[1] + lb[3]) / 2, 1), w=round(lb[2] - lb[0], 1), h=round(lb[3] - lb[1], 1))
def rings_of(geom, tol):
    out = []
    for poly in ([geom] if geom.geom_type == "Polygon" else geom.geoms):
        g = poly.simplify(tol)
        if g.is_empty or g.geom_type != "Polygon": continue
        for r in [g.exterior] + list(g.interiors):
            pts = list(r.coords)
            if len(pts) >= 4 and area(pts) >= 10: out.append(pts)
    return out
LAND = rings_of(land2, 0.6)
MINI_O = (lb[0] - 50, lb[1] - 50)
MINI_S = min(220 / (lb[2] - lb[0] + 100), 150 / (lb[3] - lb[1] + 100))
MINI_WH = ((lb[2] - lb[0] + 100) * MINI_S, (lb[3] - lb[1] + 100) * MINI_S)
mini_rings = rings_of(land2, 1.2 / MINI_S)
MINI_D = path_d([[((x - MINI_O[0]) * MINI_S, (y - MINI_O[1]) * MINI_S) for x, y in r] for r in mini_rings])
RING_BB = [(min(p[0] for p in r), min(p[1] for p in r), max(p[0] for p in r), max(p[1] for p in r), r) for r in LAND]

REG = [("NA", "North America", ["US", "CA"]), ("EU", "Europe", ["GB", "DE"]), ("APAC", "Asia-Pacific", ["JP"])]
regions = []
for rid, rname, ccs in REG:
    hs = [h for h in hubs if h["cc"] in ccs]
    cy_ = [c["y"] for c in cities if c["cc"] in ccs]
    fx = sum(h["x"] for h in hs) / len(hs)
    # the region's view fits its hubs' ground: yards, roads, cities and stores
    b_ = unary_union([g for cc in ccs for g in fp[cc]]).bounds
    top = min([s["y"] - 40 for s in stores if s["cc"] in ccs] + [c["ly"] - 24 for c in cities if c["cc"] in ccs])
    # its land (the pieces its hubs stand on): where its day and night shade falls
    lb_ = unary_union([part_of[HOME[cc]] for cc in ccs] + ([part_of["GB"], part_of["EU"]] if rid == "EU" else [])).bounds
    regions.append(dict(id=rid, name=rname, ccs=ccs, x=round(fx, 1), y=round(top - 30, 1),
                        fit=dict(cx=round((b_[0] + b_[2]) / 2, 1), cy=round((b_[1] + b_[3]) / 2, 1), w=round(b_[2] - b_[0] + 120, 1), h=round(b_[3] - b_[1] + 120, 1)),
                        land=dict(cx=round((lb_[0] + lb_[2]) / 2, 1), cy=round((lb_[1] + lb_[3]) / 2, 1), w=round(lb_[2] - lb_[0], 1), h=round(lb_[3] - lb_[1], 1))))


# ------------------------------------------------------------------ decoration
rnd = random.Random(7)
DESERTS = [((-112, 34), 5, 4), ((-117, 37), 3, 3), ((-3.5, 39.8), 2.4, 1.6)]
def in_desert(lon, lat):
    return any(((lon - c[0]) / rx) ** 2 + ((lat - c[1]) / ry) ** 2 < 1 for c, rx, ry in DESERTS)
def near_cluster(x, y, pad=0):
    return any(math.hypot(x - cx, (y - cy) / YS) < r + pad for cx, cy, r in cluster_pts)

trees = []
tries = 0
while len(trees) < 2100 and tries < 200000:
    tries += 1
    x = rnd.random() * W; y = rnd.random() * H
    if near_cluster(x, y, 22) or not on_land(x, y): continue
    lon, lat = to_lonlat(x, y)
    if in_desert(lon, lat): continue
    if any(abs(x - a) < 12 and abs(y - b) < 8 for a, b, _ in trees[-80:]): continue
    kind = "tc" if (lat > 50 or rnd.random() < 0.42) else ("tb" if rnd.random() < 0.3 else "ta")
    trees.append((x, y, kind))
MOUNTS_LL = [(-80.5, 38.6, 0.6), (-78.6, 40.6, 0.55), (-121.5, 46.5, 0.9), (-118.6, 37.2, 0.9), (-105.6, 40.3, 1.0), (-110.6, 44.5, 0.9), (6.9, 45.9, 0.8), (13.0, 47.3, 0.8), (9.5, 46.6, 0.8), (-0.5, 42.7, 0.7), (24.5, 45.6, 0.6), (8.2, 61.5, 0.8), (-116, 51, 1.2), (-113, 47, 1.0), (-109, 43, 1.1), (-106, 39, 1.0), (-121, 56, 0.9), (-70, -18, 1.1), (-70, -28, 1.2), (-72, -38, 1.0),
             (-76, -8, 0.9), (79, 33, 1.3), (84, 29.5, 1.5), (89, 28.5, 1.4), (94, 29.5, 1.2), (73, 37, 1.1), (60, 59, 0.8), (59, 55, 0.8),
             (44, 42.5, 0.9), (15, 65, 0.9), (18, 68, 0.8), (37, -3, 0.9), (-6, 31.5, 0.8), (100, 37, 0.9), (147, -6, 0.8), (-150, 63, 0.9),
             (-135, 60, 0.9), (7.5, 46.4, 0.9), (10.5, 46.8, 0.9), (138.2, 36.6, 1.0), (137.6, 35.9, 0.9), (-3.8, 56.9, 0.6)]
mounts = []
for lon, lat, s in MOUNTS_LL:
    if not any(g.contains(Point(lon, lat)) for g in PIECE_GEOM.values()): continue
    x, y = P(lon, lat)
    if near_cluster(x, y, 8) or not on_land(x, y): continue
    mounts.append((x, y, s))
waves = []
k = 0
while len(waves) < 280 and k < 60000:
    k += 1
    x = rnd.random() * W; y = rnd.random() * H
    if on_land(x, y) or any(math.hypot(x - a, y - b) < 60 for a, b in waves): continue
    if any(on_land(x + dx, y + dy) for dx, dy in ((22, 0), (-22, 0), (0, 16), (0, -16))): continue
    waves.append((x, y))

lm_pts = [(l["x"], l["y"], 44) for l in landmarks]
def busy(x, y, pad):
    return near_cluster(x, y, pad) or any(math.hypot(x - a, (y - b) / YS) < r + pad for a, b, r in lm_pts)
def coast_dist(x, y, rmax=90, step=6):
    for r in range(step, rmax + 1, step):
        for a in range(0, 360, 30):
            if not on_land(x + r * math.cos(math.radians(a)), y + r * math.sin(math.radians(a))): return r
    return rmax + step
hills, lakes, flowers, lighthouses, boats = [], [], [], [], []
k = 0
while len(lakes) < 8 and k < 90000:
    k += 1
    x = rnd.random() * W; y = rnd.random() * H
    if not on_land(x, y) or busy(x, y, 34) or coast_dist(x, y) < 34: continue
    if any(math.hypot(x - a, y - b) < 220 for a, b, _ in lakes): continue
    lakes.append((x, y, 16 + rnd.random() * 12))
k = 0
while len(hills) < 70 and k < 120000:
    k += 1
    x = rnd.random() * W; y = rnd.random() * H
    if not on_land(x, y) or busy(x, y, 12) or coast_dist(x, y, 24) < 14: continue
    if any(math.hypot(x - a, y - b) < 48 for a, b, _ in hills) or any(math.hypot(x - a, y - b) < r + 30 for a, b, r in lakes): continue
    hills.append((x, y, 0.8 + rnd.random() * 0.7))
k = 0
while len(flowers) < 420 and k < 60000:
    k += 1
    x = rnd.random() * W; y = rnd.random() * H
    if not on_land(x, y) or busy(x, y, 6): continue
    flowers.append((x, y, rnd.choice(["fl1", "fl2", "fl3"])))
k = 0
while len(lighthouses) < 7 and k < 60000:
    k += 1
    x = rnd.random() * W; y = rnd.random() * H
    if not on_land(x, y) or busy(x, y, 24): continue
    cd = coast_dist(x, y, 24, 4)
    if cd > 12: continue
    if any(math.hypot(x - a, y - b) < 420 for a, b in lighthouses): continue
    lighthouses.append((x, y))
k = 0
while len(boats) < 12 and k < 60000:
    k += 1
    x = rnd.random() * W; y = rnd.random() * H
    if on_land(x, y) or any(on_land(x + dx, y + dy) for dx, dy in ((26, 0), (-26, 0), (0, 18), (0, -18))): continue
    near = any(on_land(x + 70 * math.cos(math.radians(a)), y + 70 * math.sin(math.radians(a))) for a in range(0, 360, 30))
    if not near or any(math.hypot(x - a, y - b) < 160 for a, b in boats): continue
    boats.append((x, y))
islets, ships = [], []
k = 0
while len(islets) < 22 and k < 90000:
    k += 1
    x = rnd.random() * W; y = rnd.random() * H
    if on_land(x, y) or any(on_land(x + 50 * math.cos(math.radians(a)), y + 50 * math.sin(math.radians(a))) for a in range(0, 360, 30)): continue
    if not any(on_land(x + 170 * math.cos(math.radians(a)), y + 170 * math.sin(math.radians(a))) for a in range(0, 360, 20)): continue
    if any(math.hypot(x - a, y - b) < 170 for a, b, _ in islets) or any(math.hypot(x - a, y - b) < 60 for a, b in boats): continue
    islets.append((x, y, 9 + rnd.random() * 8))
k = 0
while len(ships) < 4 and k < 60000:
    k += 1
    x = lb[0] + rnd.random() * (lb[2] - lb[0]); y = lb[1] + rnd.random() * (lb[3] - lb[1]) + 120
    if on_land(x, y) or any(on_land(x + 80 * math.cos(math.radians(a)), y + 80 * math.sin(math.radians(a))) for a in range(0, 360, 30)): continue
    if any(math.hypot(x - a, y - b) < 300 for a, b in ships) or any(math.hypot(x - a, y - b) < 90 for a, b, _ in islets): continue
    ships.append((x, y))
waves = [(x, y) for x, y in waves if all(math.hypot(x - a, y - b) > 40 for a, b in boats + ships) and all(math.hypot(x - a, y - b) > 50 for a, b, _ in islets)]


# ------------------------------------------------------------------ export: terrain, roads, geometry, art, fixture
# Everything below writes into the app (paths relative to this script's app: ../../src/...).
APP_SRC = os.path.normpath(os.path.join(HERE, "..", "..", "src"))
WORLD_DIR = os.path.join(APP_SRC, "pages", "world")
os.makedirs(WORLD_DIR, exist_ok=True)

def F(v): return f"{v:.1f}"
def var_ns(s):
    """The art's colour tokens live under --pdw-* (src/pages/world/art.css)."""
    return re.sub(r"var\(--(?!pdw-)", "var(--pdw-", s)

LAND_D = path_d(LAND)
# The shared shapes below are drawn through <use>: their copies live in the <use>'s shadow tree, which a scoped
# selector (.pd-world .t-crown) cannot reach. So they carry their colour inline; the --pdw-* tokens still inherit.
SHARED_PAINT = {"t-shadow": "fill:var(--pdw-t-shadow)", "t-trunk": "fill:var(--pdw-trunk)", "t-crown": "fill:var(--pdw-crown)",
                "t-crown2": "fill:var(--pdw-crown2)", "t-hi": "fill:var(--pdw-crown-hi)", "t-conifer": "fill:var(--pdw-conifer)",
                "t-conifer-hi": "fill:var(--pdw-conifer-hi)", "fl-a": "fill:var(--pdw-fl-a)", "fl-b": "fill:var(--pdw-fl-b)",
                "fl-c": "fill:var(--pdw-fl-c)", "h-hill": "fill:var(--pdw-hill)", "h-hill-hi": "fill:var(--pdw-hill-hi)",
                "m-rock": "fill:var(--pdw-rock)", "m-shade": "fill:var(--pdw-rock-shade)", "m-snow": "fill:var(--pdw-snow)",
                "w-wave": "stroke:var(--pdw-wave)"}
def painted(markup):
    return re.sub(r'class="([a-z0-9-]+)"', lambda m: f'style="{SHARED_PAINT[m.group(1)]}"' if m.group(1) in SHARED_PAINT else m.group(0), markup)
TREE_A = '<ellipse cx="14" cy="18.8" rx="8.5" ry="1.8" class="t-shadow"/><rect x="5.2" y="12" width="1.6" height="7" class="t-trunk"/><ellipse cx="6" cy="9" rx="5.6" ry="8" class="t-crown"/><ellipse cx="4.4" cy="6.8" rx="2.4" ry="3.6" class="t-hi"/>'
TREE_B = '<ellipse cx="13.5" cy="18.8" rx="8" ry="1.7" class="t-shadow"/><rect x="5.2" y="13" width="1.6" height="6" class="t-trunk"/><ellipse cx="6" cy="10.5" rx="5.4" ry="6.4" class="t-crown2"/><ellipse cx="4.5" cy="8.8" rx="2.2" ry="2.8" class="t-hi"/>'
TREE_C = '<ellipse cx="14" cy="20.8" rx="8.5" ry="1.7" class="t-shadow"/><rect x="5.2" y="16" width="1.6" height="5" class="t-trunk"/><path d="M6 0 L11.5 17 H0.5 Z" class="t-conifer"/><path d="M6 0 L3.2 17 H0.5 Z" class="t-conifer-hi"/>'
defs = [
    f'<path id="pdw-land" d="{LAND_D}"/>',
    '<clipPath id="pdw-landclip"><use href="#pdw-land"/></clipPath>',
    '<radialGradient id="pdw-desert"><stop offset="0" class="gd-a"/><stop offset=".7" class="gd-b"/><stop offset="1" class="gd-c"/></radialGradient>',
    '<radialGradient id="pdw-meadow"><stop offset="0" class="gm-a"/><stop offset="1" class="gm-b"/></radialGradient>',
    f'<linearGradient id="pdw-landgrad" gradientUnits="userSpaceOnUse" x1="{lb[0]:.0f}" y1="{lb[1]:.0f}" x2="{lb[2]:.0f}" y2="{lb[3]:.0f}"><stop offset="0" class="lg-lit"/><stop offset=".5" class="lg-mid"/><stop offset="1" class="lg-shade"/></linearGradient>',
    '<radialGradient id="pdw-glint"><stop offset="0" stop-color="#fff6dc" stop-opacity=".75"/><stop offset=".45" stop-color="#ffe2b0" stop-opacity=".32"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>',
    '<symbol id="pdw-hill" viewBox="0 0 60 24"><path d="M0 24 Q12 5 30 3 Q48 5 60 24 Z" class="h-hill"/><path d="M6 24 Q14 8 30 4.5 Q19 12 19 24 Z" class="h-hill-hi"/></symbol>',
    '<symbol id="pdw-mt" viewBox="0 0 44 34"><path d="M0 34 L19 2 L44 34 Z" class="m-rock"/><path d="M19 2 L44 34 H27 Z" class="m-shade"/><path d="M19 2 L25.5 12.5 L22 11.2 L19.6 14 L16.6 11 L13.2 12.6 Z" class="m-snow"/></symbol>',
    # trees, flowers and waves are plain groups drawn at their final size: a <use> of them needs only x and y
    f'<g id="pdw-ta"><g transform="translate(0 2) scale(1.35)">{TREE_A}</g></g>',
    f'<g id="pdw-tb"><g transform="translate(0 2) scale(1.35)">{TREE_B}</g></g>',
    f'<g id="pdw-tc"><g transform="translate(0 2.7) scale(1.35)">{TREE_C}</g></g>',
    '<g id="pdw-fl1"><circle cx="1.6" cy="2.6" r="1.3" class="fl-a"/><circle cx="4.4" cy="1.8" r="1.2" class="fl-b"/><circle cx="6.4" cy="3.4" r="1.1" class="fl-a"/></g>',
    '<g id="pdw-fl2"><circle cx="2" cy="2" r="1.2" class="fl-c"/><circle cx="5" cy="3.2" r="1.3" class="fl-b"/></g>',
    '<g id="pdw-fl3"><circle cx="1.8" cy="3" r="1.2" class="fl-c"/><circle cx="4.2" cy="1.6" r="1.1" class="fl-a"/><circle cx="6.4" cy="2.8" r="1.2" class="fl-c"/></g>',
    '<g id="pdw-wv"><path d="M1 5 q3.5 -4 7 0 t7 0 t7 0" fill="none" stroke-width="1.6" stroke-linecap="round" class="w-wave"/></g>',
]
t = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">', "<defs>"] + [painted(d) for d in defs] + ["</defs>",
     f'<rect x="0" y="0" width="{W}" height="{H}" class="w-sea"/>']
t.append("<g>" + "".join(f'<use href="#pdw-wv" x="{F(x - 15)}" y="{F(y - 4)}"/>' for x, y in waves) + "</g>")
t.append(f'<ellipse cx="{lb[2] - 160:.0f}" cy="{lb[1] - 60:.0f}" rx="150" ry="420" class="w-glint" fill="url(#pdw-glint)" transform="rotate(-24 {lb[2] - 160:.0f} {lb[1] - 60:.0f})"/>')
t.append('<use href="#pdw-land" class="w-shallow" stroke-width="46" stroke-linejoin="round" transform="translate(0 26)"/>')
t.append('<use href="#pdw-land" class="w-shallow2" stroke-width="20" stroke-linejoin="round" transform="translate(0 26)"/>')
t.append('<use href="#pdw-land" class="w-foam" stroke-width="5" stroke-linejoin="round" transform="translate(0 26)"/>')
for dy, cls in ((26, "w-cliff4"), (20, "w-cliff3"), (14, "w-cliff2"), (8, "w-cliff1")):
    t.append(f'<use href="#pdw-land" class="{cls}" stroke-width="1.2" stroke-linejoin="round" transform="translate(0 {dy})"/>')
t.append('<use href="#pdw-land" class="w-dirt" transform="translate(0 3)"/>')
t.append('<use href="#pdw-land" class="w-land-grad"/>')
t.append('<use href="#pdw-land" class="w-rim" fill="none" stroke-width="3" stroke-linejoin="round"/>')
for x, y, r in islets:
    t.append(f'<ellipse cx="{F(x)}" cy="{F(y + 9)}" rx="{F(r * 2.1)}" ry="{F(r * 1.5)}" class="w-shallow2-fill"/>'
             f'<ellipse cx="{F(x)}" cy="{F(y + 8)}" rx="{F(r * 1.15)}" ry="{F(r * 0.78)}" class="w-cliff-fill"/>'
             f'<ellipse cx="{F(x)}" cy="{F(y)}" rx="{F(r * 1.15)}" ry="{F(r * 0.78)}" class="w-islet"/>'
             f'<use href="#pdw-tc" x="{F(x - 8.1)}" y="{F(y - 32.4)}"/>')
t.append('<g clip-path="url(#pdw-landclip)">')
for (lon, lat), rx, ry in DESERTS:
    x, y = P(lon, lat); k_ = px_per_deg(lon, lat)
    t.append(f'<ellipse cx="{F(x)}" cy="{F(y)}" rx="{F(rx * k_ * 1.1)}" ry="{F(ry * k_ * 1.3)}" fill="url(#pdw-desert)"/>')
for cx, cy, r in cluster_pts[::3]:
    t.append(f'<circle cx="{F(cx)}" cy="{F(cy)}" r="150" fill="url(#pdw-meadow)"/>')
t.append("</g>")
for x, y, r in lakes:
    t.append(f'<ellipse cx="{F(x)}" cy="{F(y)}" rx="{F(r * 1.5 + 4)}" ry="{F(r + 3)}" class="w-sand"/><ellipse cx="{F(x)}" cy="{F(y + 1)}" rx="{F(r * 1.5)}" ry="{F(r)}" class="w-lake"/><ellipse cx="{F(x - r * 0.4)}" cy="{F(y - r * 0.3)}" rx="{F(r * 0.55)}" ry="{F(r * 0.18)}" class="w-lake-hi"/>')
for h in hubs:
    hx, hy = h["x"], h["y"]
    t.append(f'<circle cx="{F(hx)}" cy="{F(hy)}" r="{YARD}" class="w-yard"/>'
             f'<circle cx="{F(hx)}" cy="{F(hy)}" r="{YARD - 5}" class="w-fence" fill="none" stroke-width="1.8" stroke-dasharray="2 5"/>'
             f'<rect x="{F(hx - 84)}" y="{F(hy + 14)}" width="168" height="66" rx="8" class="w-lot"/>'
             + "".join(f'<path d="M{F(hx - 80 + 16 * i)} {F(hy + 18)} V{F(hy + 44)} M{F(hx - 80 + 16 * i)} {F(hy + 48)} V{F(hy + 76)}" class="w-bay" stroke-width="1.2"/>' for i in range(11)))
for h in hubs:
    x0, y0, x1, y1 = h["fbox"]
    t.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0:.1f}" height="{y1 - y0:.1f}" rx="6" class="w-fence" fill="none" stroke-width="1.6" stroke-dasharray="1.6 4"/>')
t.append("<g>" + "".join(f'<use href="#pdw-hill" x="{F(x - 30 * s)}" y="{F(y - 24 * s)}" width="{F(60 * s)}" height="{F(24 * s)}"/>' for x, y, s in sorted(hills, key=lambda h: h[1])) + "</g>")
t.append("<g>" + "".join(f'<use href="#pdw-mt" x="{F(x - 22 * s)}" y="{F(y - 44 * s)}" width="{F(44 * s)}" height="{F(44 * s)}"/>' for x, y, s in sorted(mounts, key=lambda m: m[1])) + "</g>")
t.append("<g>" + "".join(f'<use href="#pdw-{k}" x="{F(x - 4)}" y="{F(y - 2.5)}"/>' for x, y, k in flowers) + "</g>")
t.append("<g>" + "".join(f'<use href="#pdw-{k}" x="{F(x - 8.1)}" y="{F(y - 32.4 if k == "tc" else y - 29)}"/>' for x, y, k in sorted(trees, key=lambda t_: t_[1])) + "</g>")
t.append("</svg>")
def inline_paint(markup):
    """The terrain is shown as one image (layers.tsx Terrain), which no stylesheet reaches: each class with a rule of its
    own in art.css (`.pd-world .x { ... }`) takes that rule inline, tokens and all (the app fills the tokens in)."""
    with open(os.path.join(WORLD_DIR, "art.css")) as fh:
        rules = {c: ";".join(d.strip() for d in body.split(";") if d.strip())
                 for c, body in re.findall(r"^\.pd-world \.([a-z0-9-]+) \{([^}]*)\}", fh.read(), re.M)}
    def tag(m):
        t = m.group(0)
        c = re.search(r' class="([a-z0-9-]+)"', t)
        if not c or c.group(1) not in rules: return t
        t = t.replace(c.group(0), "")
        if ' style="' in t: return t.replace(' style="', f' style="{rules[c.group(1)]};', 1)
        return re.sub(r"(/?>)$", f' style="{rules[c.group(1)]}"\\1', t)
    return re.sub(r"<[a-zA-Z][^>]*>", tag, markup)
TERRAIN = inline_paint("".join(t))

drives = []
for c in cities:
    for si in c["stores"]:
        st_ = stores[si]
        dx_, dy_ = st_["x"] - c["x"], st_["y"] - 3 - c["y"]; L_ = math.hypot(dx_, dy_) or 1
        drives.append(f"M{c['x'] + dx_ / L_ * 30:.1f} {c['y'] + dy_ / L_ * 30:.1f}L{st_['x']:.1f} {st_['y'] - 3:.1f}")
rd = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false"><g fill="none" stroke-linecap="round">']
rd += [f'<path class="w-road-edge" d="{d}" stroke-width="10"/>' for d in drives]
rd += [f'<path class="w-road" d="{d}" stroke-width="6"/>' for d in drives]
rd += [f'<path class="w-road-shadow" d="{d}" stroke-width="{ROAD_W + 10}" transform="translate(2 4)"/>' for cc, d in road_paths]
rd += [f'<path class="w-road-edge" d="{d}" stroke-width="{ROAD_W + 5}"/>' for cc, d in road_paths]
rd += [f'<path class="w-road" d="{d}" stroke-width="{ROAD_W}"/>' for cc, d in road_paths]
rd += [f'<path class="w-road-dash" d="{d}" stroke-width="1.6" stroke-dasharray="7 7"/>' for cc, d in road_paths]
rd += [f'<circle cx="{c["x"]}" cy="{c["y"]}" r="32" class="w-plaza"/><circle cx="{c["x"]}" cy="{c["y"]}" r="21" class="w-plaza-in"/>' for c in cities]
rd.append("</g>")
for h in hubs:
    hx, hy = h["x"], h["y"]
    wa_, fa_ = math.radians(h["wa"]), math.radians(h["fa"])
    ws_road = f'M{F(hx + RING * math.cos(wa_))} {F(hy + RING * math.sin(wa_))}L{F(h["wx"])} {F(h["wy"] + 8)}'
    fx0, fy0, fx1, fy1 = h["fbox"]
    track = f'M{F(hx + (RING + 10) * math.cos(fa_))} {F(hy + (RING + 10) * math.sin(fa_))}L{F((fx0 + fx1) / 2)} {F((fy0 + fy1) / 2)}'
    rd.insert(1, f'<path class="w-track" d="{track}" stroke-width="2" stroke-dasharray="3 5"/>')
    rd.insert(1, f'<path class="w-road" d="{ws_road}" stroke-width="8"/>')
    rd.insert(1, f'<path class="w-road-edge" d="{ws_road}" stroke-width="12"/>')
rd.insert(-1, "".join(f'<circle cx="{F(h["x"])}" cy="{F(h["y"])}" r="{RING}" class="w-road-edge" fill="none" stroke-width="{ROAD_W + 5}"/>'
                      f'<circle cx="{F(h["x"])}" cy="{F(h["y"])}" r="{RING}" class="w-road" fill="none" stroke-width="{ROAD_W}"/>'
                      f'<circle cx="{F(h["x"])}" cy="{F(h["y"])}" r="{RING}" class="w-road-dash" fill="none" stroke-width="1.6" stroke-dasharray="7 7"/>' for h in hubs))
rd.append("</svg>")
ROADS = "".join(rd)

def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
HUB_ID = {c[0]: c[7][0] for c in COUNTRIES}
CITY_KEY = [f'{c["cc"]}-{slug(c["name"])}' for c in cities]
r1 = lambda v: round(v, 1)
geo = {
    "w": W, "h": H,
    "fit": FIT,
    "mini": {"scale": round(MINI_S, 6), "origin": [r1(MINI_O[0]), r1(MINI_O[1])], "size": [round(MINI_WH[0]), round(MINI_WH[1])], "d": MINI_D},
    "regions": [{"id": r["id"], "name": r["name"], "countries": r["ccs"], "x": r["x"], "y": r["y"], "fit": r["fit"], "land": r["land"]} for r in regions],
    "hubs": [{"hubId": HUB_ID[h["cc"]], "countryCode": h["cc"], "x": h["x"], "y": h["y"], "ring": RING, "barn": list(h["barn"]), "label": list(h["label"]),
              "bays": [list(b) for b in h["bays"]], "workshop": [h["wx"], h["wy"]], "workshopBays": [list(b) for b in h["wbays"]]} for h in hubs],
    "cities": [{"cityKey": CITY_KEY[i], "countryCode": c["cc"], "hubId": HUB_ID[c["cc"]], "x": c["x"], "y": c["y"], "from": [c["sx"], c["sy"]], "ctrl": [c["qx"], c["qy"]], "label": [c["lx"], c["ly"]]} for i, c in enumerate(cities)],
    "stores": [{"storeId": s["id"], "cityKey": CITY_KEY[s["city"]], "x": s["x"], "y": s["y"]} for s in stores],
    "fields": [{"hubId": HUB_ID[f_["cc"]], "fieldNo": f_["no"], "variety": f_["variety"], "x": f_["x"], "y": f_["y"]} for f_ in fields],
    "landmarks": [{"kind": l["kind"], "name": l["name"], "cityKey": CITY_KEY[l["city"]], "x": l["x"], "y": l["y"]} for l in landmarks],
    "decor": {"lighthouses": [[r1(x), r1(y)] for x, y in lighthouses], "boats": [[r1(x), r1(y)] for x, y in boats], "ships": [[r1(x), r1(y)] for x, y in ships]},
}
def check_layout():
    """Every sprite stands on land, clear of the coast, and clear of the other hubs' things."""
    problems = []
    def clearance(x, y):
        if not on_land(x, y): return 0
        return coast_dist(x, y, 30, 3)
    items = [(f"store {s['id']}", s["x"], s["y"] - 8, s["cc"], 24) for s in stores]
    items += [(f"{h['cc']} barn", h["barn"][0], h["barn"][1] - 30, h["cc"], 28) for h in hubs]
    items += [(f"{h['cc']} workshop", h["wx"], h["wy"] - 10, h["cc"], 24) for h in hubs]
    items += [(f"field {f_['id']}", f_["x"], f_["y"], f_["cc"], 16) for f_ in fields]
    items += [(f"plaza {cities[l['city']]['name']}", l["x"], l["y"] - 10, cities[l["city"]]["cc"], 16) for l in landmarks]
    items += [(f"label {c['name']}", c["lx"], c["ly"], c["cc"], 10) for c in cities]
    for name, x, y, cc, margin in items:
        c = clearance(x, y)
        if c < margin: problems.append(f"{name} is {'in the sea' if c == 0 else f'{c}px from the coast'}")
    for c in cities:
        for fs in (10.5, 16):       # the label's font in plane px, close up (labelSize in model.ts)
            w, h = 0.56 * fs * len(c["name"]) + 1.3 * fs, 1.45 * fs
            corners = [(c["lx"] - w / 2, c["ly"]), (c["lx"] + w / 2, c["ly"]), (c["lx"] - w / 2, c["ly"] - h), (c["lx"] + w / 2, c["ly"] - h)]
            if not all(on_land(x, y) for x, y in corners):
                problems.append(f"label {c['name']} hangs over the sea at {fs}px"); break
    for i, (n1, x1, y1, c1, _) in enumerate(items):
        for n2, x2, y2, c2, _ in items[i + 1:]:
            if c1 != c2 and math.hypot(x1 - x2, y1 - y2) < 70: problems.append(f"{n1} ({c1}) crowds {n2} ({c2})")
    return problems
PROBLEMS = check_layout()
if PROBLEMS:
    print("layout problems:\n  " + "\n  ".join(PROBLEMS[:40]))
    if os.environ.get("WORLD_STRICT", "1") == "1": raise SystemExit(1)

HEADER = "/* Generated by scripts/world/gen_world.py — do not edit by hand. */\n"
with open(os.path.join(WORLD_DIR, "geo.ts"), "w") as fh:
    fh.write(HEADER)
    fh.write('import type { WorldGeo } from "./types";\n\n')
    fh.write("/** Where everything stands on the map, in plane pixels (see WorldGeo). */\n")
    fh.write("export const GEO: WorldGeo = " + json.dumps(geo, separators=(",", ":")) + ";\n\n")
    fh.write("/**\n * The terrain: sea, four land masses cut from real coastlines (Natural Earth 1:50m: North America, Britain and\n"
             " * Ireland, the rest of Europe, Japan), cliffs, beaches, lakes, hills, mountains, forests, flowers, fenced fields.\n"
             " * Static markup with its paint inline (art.css's rules, tokens and all), shown as one image (layers.tsx Terrain).\n */\n")
    fh.write("export const TERRAIN_SVG = " + json.dumps(TERRAIN) + ";\n\n")
    fh.write("/** The roads: the hubs' ring roads, hub-to-city roads with their plazas, store driveways and farm tracks (a layer the viewer can hide). */\n")
    fh.write("export const ROADS_SVG = " + json.dumps(ROADS) + ";\n")

# ---- art (sprites), colour tokens and their CSS
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location("world_art", os.path.join(HERE, "art.py")); art = _ilu.module_from_spec(_spec); _spec.loader.exec_module(art)
sprites = {
    "STORE_SVG": art.STORE_SVG, "HUB_SVG": art.HUB_SVG, "WORKSHOP_SVG": art.WS_SVG, "VAN_SVG": art.VAN_SVG, "PARKED_VAN_SVG": art.MINI_VAN,
    "LIGHTHOUSE_SVG": art.LIGHTHOUSE, "BOAT_SVG": art.BOAT, "SHIP_SVG": art.CARGO,
    "PUMPKIN_OK_SVG": art.PK_FULL, "PUMPKIN_LOW_SVG": art.PK_HALF, "PUMPKIN_OUT_SVG": art.PK_OUT,
}
with open(os.path.join(WORLD_DIR, "art.ts"), "w") as fh:
    fh.write(HEADER)
    fh.write('import type { LandmarkKind, WorldStat } from "./types";\nimport type { Variety } from "../../types";\n\n')
    fh.write("/*\n * The map's hand-drawn sprites (scripts/world/art.py): static SVG markup, coloured by the --pdw-* tokens in\n"
             " * art.css. A van's box takes its status colour from `color` (currentColor); `.is-empty` paints it as an empty van.\n */\n")
    for k, v in sprites.items():
        fh.write(f"export const {k} = " + json.dumps(var_ns(v)) + ";\n")
    fh.write("\n/** Each city's plaza icon, by kind: its landmark (eight cities) or a pumpkin fountain. */\nexport const LANDMARK_SVG: Record<LandmarkKind, string> = " + json.dumps({k: var_ns(v) for k, v in art.LANDMARK_SVG.items()}, indent=1) + ";\n")
    fh.write("\n/** A field's rows of pumpkins (inside its soil bed), by variety. */\nexport const FIELD_DOTS: Record<Variety, string> = " + json.dumps(art.FIELD_DOTS, indent=1) + ";\n")
    fh.write("\n/** The counters' icon tiles: [tint, icon]. */\nexport const STAT_ICON: Record<WorldStat, [string, string]> = " + json.dumps({k: [v[0], v[1]] for k, v in art.STAT_ICONS.items()}, indent=1) + ";\n")

# ---- the static preview's fixture: the simulated hubs, vans and stores at the shell fixture's clock
NOW_MS = int(datetime.datetime(2026, 10, 28, 18, 20, tzinfo=datetime.timezone.utc).timestamp() * 1000)  # src/fixtures/shell.ts
def iso(ms): return datetime.datetime.fromtimestamp(ms / 1000, datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
CAPS = {"Flagship": (420, 150, 400), "Standard": (300, 120, 280), "Express": (220, 90, 200)}
TZ = {"US": "America/New_York", "CA": "America/Toronto", "GB": "Europe/London", "DE": "Europe/Berlin", "JP": "Asia/Tokyo"}
MODEL = {c[0]: c[7][4] for c in COUNTRIES}
HUB_NAME = {c[0]: c[7][1] for c in COUNTRIES}
def stock_of(lvl): return "ok" if lvl > 0.35 else ("low" if lvl > 0.08 else "out")
heading = {}
fx_vans = []
for tr_ in trucks:
    cc = tr_["cc"]; st_ = stores[tr_["store"]]; city = cities[st_["city"]]; status = tr_["status"]
    status = "at_hub" if status == "hub" else status
    outbound = status in ("loading", "driving", "stopped", "unloading")
    on_road = status not in ("at_hub", "workshop")
    frac = tr_["frac"] if on_road else 0
    if status == "loading": frac = 0
    if status == "unloading": frac = 1
    if status == "returning": frac = round(1 - tr_["frac"] * 0.9, 3)
    eta = NOW_MS + int((1 - frac) * city["drive"] * 60000) + (25 * 60000 if status == "stopped" else 0) if outbound else None
    late = {"minutes": 34 if status == "stopped" else 0, "cause": "traffic" if status == "stopped" else None, "note": f"Traffic on {city['road']}" if status == "stopped" else None}
    if outbound: heading[tr_["store"]] = (tr_, status, eta)
    fx_vans.append({
        "truckId": f"PK-{cc}-{tr_['id']}", "fleetNo": tr_["id"], "label": f"Express {tr_['id']}", "hubId": HUB_ID[cc], "countryCode": cc, "status": status,
        "cityKey": CITY_KEY[st_["city"]] if on_road else None, "storeId": st_["id"] if outbound else None, "storeName": st_["name"] if outbound else None,
        "frac": round(frac, 3), "etaAt": iso(eta) if eta else None, "plannedAt": iso(eta - late["minutes"] * 60000) if eta else None,
        "driveMin": city["drive"] if on_road else None, "roadKm": city["km"] if on_road else None,
        "units": tr_["bins"] * 50 if outbound and status != "unloading" else 0, "bins": tr_["bins"] if outbound else 0, "late": late,
        "driver": "", "model": MODEL[cc], "plate": tr_.get("plate"), "workshopJob": tr_.get("reason") if status == "workshop" else None,
    })
fx_stores = []
for s in stores:
    city = cities[s["city"]]; cap = CAPS[s["fmt"]]; lvl = s["lvl"]; cc = s["cc"]
    shelves = [{"variety": v, "onHand": int(round(min(1, lvl * m) * c_)), "capacity": c_} for v, c_, m in zip(("Carving", "Cooking", "Mini"), cap, (1.0, 1.1, 0.9))]
    stock = stock_of(lvl)
    nxt = heading.get(stores.index(s))
    open_ = cc in ("US", "CA")
    fx_stores.append({
        "storeId": s["id"], "name": s["name"], "format": s["fmt"].lower(), "cityKey": CITY_KEY[s["city"]], "countryCode": cc, "tz": TZ[cc],
        "stock": stock, "shortVariety": None if stock == "ok" else "Carving", "shelves": shelves, "isOpen": open_,
        "opensAt": None if open_ else "2026-10-29T08:00:00Z", "closesAt": "2026-10-29T01:00:00Z" if open_ else "2026-10-29T19:00:00Z",
        "next": {"truckId": f"PK-{cc}-{nxt[0]['id']}", "label": f"Express {nxt[0]['id']}", "status": nxt[1], "etaAt": iso(nxt[2]), "units": nxt[0]["bins"] * 50} if nxt else None,
    })
fx_hubs = []
for c in COUNTRIES:
    cc = c[0]; vs = [v for v in fx_vans if v["countryCode"] == cc]
    count = lambda *st: sum(1 for v in vs if v["status"] in st)
    picking = cc in ("US", "CA")
    fx_hubs.append({
        "hubId": HUB_ID[cc], "name": HUB_NAME[cc], "countryCode": cc, "tz": TZ[cc],
        "harvestStatus": "picking" if picking else "done", "harvestNote": "Picking Field 2, 5" if picking else "Harvest done for today",
        "picking": [2, 5] if picking else [], "binsToday": 118 if picking else 160, "planBinsToday": 164, "stockUnits": 9000 + len(cc) * 1000, "stockDays": 2.4,
        "vans": {"total": len(vs), "atHub": count("at_hub"), "loading": count("loading"), "onRoad": count("driving", "stopped"), "unloading": count("unloading"),
                 "returning": count("returning"), "workshop": count("workshop"), "late": sum(1 for v in vs if v["late"]["minutes"] >= 15)},
    })
fx_cities = [{"cityKey": CITY_KEY[i], "name": c["name"], "countryCode": c["cc"], "hubId": HUB_ID[c["cc"]], "roadKm": c["km"], "driveMin": c["drive"]} for i, c in enumerate(cities)]
# the Live activity panel: lines the live hook (src/data/useWorldData.ts) would write for three of the vans above
def fx_event(kind, v, at, text, tone):
    return {"key": f"{kind}:{v['truckId']}:{at}", "at": at, "countryCode": v["countryCode"], "text": text, "tone": tone}
v107 = next(v for v in fx_vans if v["fleetNo"] == 107)
v_stop = next(v for v in fx_vans if v["status"] == "stopped")
v_unload = next(v for v in fx_vans if v["status"] == "unloading" and v["countryCode"] == "CA")
fx_events = [
    fx_event("drive", v107, iso(NOW_MS - int(v107["frac"] * v107["driveMin"] * 60000)), f"Van 107 left {HUB_NAME['US']} for {v107['storeName']}", "drive"),
    fx_event("stop", v_stop, iso(NOW_MS - 6 * 60000), f"Van {v_stop['fleetNo']} stopped: {v_stop['late']['note']}", "stop"),
    fx_event("unload", v_unload, iso(NOW_MS - 3 * 60000), f"Van {v_unload['fleetNo']} is unloading at {v_unload['storeName']}", "unload"),
]
fixture = {"hubs": fx_hubs, "cities": fx_cities, "stores": fx_stores, "vans": fx_vans, "events": fx_events}
with open(os.path.join(APP_SRC, "fixtures", "world.ts"), "w") as fh:
    fh.write(HEADER)
    fh.write('import type { WorldViewModel } from "../pages/world/types";\n\n')
    fh.write("/** The World tab at the shell fixture's clock (Wed 28 Oct, 14:20 EDT): every hub, store and van, from the map generator's simulation. */\n")
    fh.write("export const fixture: WorldViewModel = " + json.dumps(fixture, ensure_ascii=False, indent=1) + ";\n")

print("geo.ts", os.path.getsize(os.path.join(WORLD_DIR, "geo.ts")), "art.ts", os.path.getsize(os.path.join(WORLD_DIR, "art.ts")),
      "terrain", len(TERRAIN), "roads", len(ROADS), "vans", len(fx_vans), "stores", len(fx_stores))
