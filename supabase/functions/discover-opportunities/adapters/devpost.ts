export async function discoverDevpost() {
  const response = await fetch(
    'https://devpost.com/hackathons'
  );

  const html = await response.text();

  const regex =
    /https:\/\/([a-z0-9-]+)\.devpost\.com/gi;

  const matches = [...html.matchAll(regex)];

  const banned = [
    'help',
    'info',
    'secure',
    'blog',
    'api',
    'www',
    'accounts'
  ];

  const opportunities = [];

  for (const match of matches) {
    const slug = match[1];

    if (!slug) continue;

    if (banned.includes(slug.toLowerCase())) {
      continue;
    }

    opportunities.push({
      title: slug.replace(/-/g, ' '),
      provider: 'Devpost',
      category: 'Hackathons',
      official_url: `https://${slug}.devpost.com`
    });
  }

  return opportunities.slice(0, 50);
}