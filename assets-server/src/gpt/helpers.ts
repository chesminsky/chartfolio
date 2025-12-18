export function getJSON(text: string): Record<string, string | null> {
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}') + 1;
  const jsonString = text.substring(startIndex, endIndex);

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return {};
  }
}
