export function stylesArrayToObject(styles: string[]): Record<string, boolean> {
  return styles.reduce((acc, style) => {
    acc[style] = true;
    return acc;
  }, {});
}
