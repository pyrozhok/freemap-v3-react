export function getEffectiveChosenLanguage(
  chosenLanguage: string | null,
): string {
  return (
    chosenLanguage ||
    [...(navigator.languages || []), navigator.language]
      .map((lang) => simplify(lang))
      .find((lang) => lang && ['en', 'sk', 'cs', 'hu', 'it'].includes(lang)) ||
    'en'
  );
}

function simplify(lang: string | null | undefined) {
  return lang?.replace(/-.*/, '');
}
