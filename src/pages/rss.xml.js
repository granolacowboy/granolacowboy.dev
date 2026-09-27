import rss from '@astrojs/rss';
import { render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer as mdxRenderer } from '@astrojs/mdx';
import { getRiver, TYPE_LABEL } from '../lib/river';
import { SITE_TITLE, SITE_DESCRIPTION } from '../site.config';

// Full-text feed across every entry type (entries, links, tils, notes, quotes).
// Bodies are rendered to HTML at build time via the Container API (with the MDX
// renderer registered for .mdx posts), so the feed carries the whole post, not a
// stub. Drafts are excluded (getRiver filters them). Per-item categories carry
// tags; a feed-level note records the authorship policy.
export async function GET(context) {
  const river = await getRiver();
  const renderers = await loadRenderers([mdxRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const items = [];
  for (const item of river) {
    const { Content } = await render(item.entry);
    const content = await container.renderToString(Content);
    items.push({
      title: item.title,
      link: item.href,
      pubDate: item.pubDate,
      description: item.entry.data.description ?? `${TYPE_LABEL[item.type]} by Rich Berman`,
      content,
      categories: item.tags,
    });
  }

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items,
    customData:
      '<language>en-us</language>' +
      '<copyright>Written by Rich Berman. Posts edited with AI assistance are marked.</copyright>',
  });
}
