// A guided tour: one click from the start circles a notable asteroid, moves the camera and the
// date to its best moment, and moves on. Pass times are JPL close-approach times (ast_close_approaches).

export type TourStop = {
  id: string; // designation, as in ast_neo_orbits
  title: string;
  text: string;
  // "watch": follow Earth and play through the pass at `date`; "follow": ride along with the asteroid.
  kind: "watch" | "follow";
  date?: string; // ISO, UTC; defaults to today
  zoom: number; // camera distance, AU
  play?: number; // days per second to run while following
  seconds: number; // time on this stop before moving on
};

export const TOUR: TourStop[] = [
  {
    id: "99942", title: "Apophis, April 2029", kind: "watch", date: "2029-04-13T21:46:12Z", zoom: 0.04, seconds: 17,
    text: "A 340 m rock that will pass closer than some satellites, inside the Moon's orbit. Around 2 billion people will be able to see it without a telescope. It won't hit.",
  },
  {
    id: "231937", title: "2001 FO32, March 2021", kind: "watch", date: "2021-03-21T16:02:43Z", zoom: 0.04, seconds: 17,
    text: "The biggest asteroid to pass Earth in 2021, about 1 km across, rushing by at 124,000 km/h, five times farther away than the Moon.",
  },
  {
    id: "3122", title: "Florence, September 2017", kind: "watch", date: "2017-09-01T12:05:50Z", zoom: 0.1, seconds: 17,
    text: "About 4 km wide, with two small moons of its own. The largest asteroid to come this close since NASA started tracking them.",
  },
  {
    id: "65803", title: "Didymos, September 2022", kind: "follow", date: "2022-09-26T23:14:00Z", zoom: 0.12, seconds: 14,
    text: "NASA crashed its DART spacecraft into Didymos's little moon on this day, and shortened that moon's orbit by 32 minutes: the first test of pushing an asteroid aside.",
  },
  {
    id: "101955", title: "Bennu", kind: "follow", zoom: 0.35, play: 7, seconds: 14,
    text: "NASA's OSIRIS-REx scooped dust from Bennu in 2020 and dropped it in the Utah desert in 2023. It has about a 1 in 2,700 chance of hitting Earth in 2182.",
  },
  {
    id: "3200", title: "Phaethon", kind: "follow", zoom: 1.1, play: 7, seconds: 16,
    text: "Swoops to less than half of Mercury's distance from the Sun, hot enough to melt lead. The dust it sheds makes the Geminid meteor shower every December.",
  },
  {
    id: "29075", title: "1950 DA", kind: "follow", zoom: 0.5, play: 30, seconds: 14,
    text: "Rates highest on NASA's watch list today, for a small chance of hitting Earth in the year 2880. Centuries of observations will settle it long before then.",
  },
];
