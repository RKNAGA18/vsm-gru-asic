/** Returns the correct URL for a public/images/ file regardless of base path. */
export const imgUrl = (filename: string): string =>
  `${import.meta.env.BASE_URL}images/${filename}`;

/** Returns the correct URL for a public/downloads/ file regardless of base path. */
export const dlUrl = (filename: string): string =>
  `${import.meta.env.BASE_URL}downloads/${filename}`;
