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
        href: "/blog/index",
        text: "Blog",
      },
    ];
  }
  if (parent === "fleeting-notes") {
    return [
      home,
      {
        href: "/fleeting-notes/index",
        text: "Fleeting Notes",
      },
    ];
  }
  return [
    home,
    {
      href: "/reference-notes/index",
      text: "Reference Notes",
    },
  ];
};
