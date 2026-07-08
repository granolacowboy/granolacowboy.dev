import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../site.config';

// Feed endpoint served at /rss.xml. Items come from the `posts` collection.
// Drafts are excluded to match the page routes. pubDate stays in frontmatter
// even though dates are hidden in the UI (SHOW_DATES); the feed still needs it.
export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/writing/${post.id}/`,
      pubDate: post.data.pubDate,
    })),
  });
}
