export async function discoverMLH() {
  const response = await fetch(
    'https://mlh.io/seasons/2026/events'
  );

  const html = await response.text();

  const links = new Set<string>();

  const regex = /https:\/\/mlh\.io\/events\/[^"' ]+/g;

  const matches = html.match(regex) || [];

  for (const match of matches) {
    links.add(match);
  }

  return Array.from(links).map(url => ({
    title: extractTitle(url),
    official_url: url,
    provider: 'Major League Hacking',
    category: 'Hackathons'
  }));
}

function extractTitle(url: string) {
  return url
    .split('/')
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) ?? 'MLH Event';
}