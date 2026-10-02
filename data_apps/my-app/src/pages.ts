// The first entry is the default page, served at the base path `/`.
export const pages = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
] as const;

export type PagePath = (typeof pages)[number]["path"];
