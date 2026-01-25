const home = {
  href: "/",
  text: "Home",
};

export const getCrumbs = (segments: string[]) => {
  const parent = segments.includes("index") ? "home" : segments[0];

  if (parent === "home") {
    return [home];
  }
  if (parent === "blog") {
    return [
      home,
      {
        href: "/blog",
        text: "Blog",
      },
    ];
  }

  return [
    home,
    {
      href: "/note",
      text: "Note",
    },
  ];
};
