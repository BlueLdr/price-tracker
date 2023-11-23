const rgba_regex =
  /^rgba?\((\d{1,3}(?:, ?\d{1,3}){2})(?:, ?((?:1(?:\.0+)?)|(?:0(?:\.\d+)?)))?\)$/;
const hex_regex = /^#([A-F0-9]{2})([A-F0-9]{2})([A-F0-9]{2})([A-F0-9]{2})?$/i;

/**
 * Converts a hex color code (#123AEF) to an rgb tuple joined with commas
 * @example `hex_to_rgb("#808080") == "128, 128, 128"`
 */
const hex_to_rgb = (hex: string) => {
  const match = hex.match(hex_regex);
  if (!match) {
    return;
  }
  const r = parseInt(match[1], 16),
    g = parseInt(match[2], 16),
    b = parseInt(match[3], 16);

  return `${r}, ${g}, ${b}`;
};

export const rgba = (color: string, opacity: number) => {
  if (typeof color !== "string") {
    return "";
  }
  const rgb = hex_to_rgb(color);
  if (rgb) {
    return `rgba(${rgb}, ${opacity})`;
  }
  const match = color.match(rgba_regex);
  if (match) {
    return `rgba(${match[1]}, ${opacity})`;
  }
  return color;
};
