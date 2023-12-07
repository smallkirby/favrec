import { FavRecord } from '../types/FavRecord';
import axios from 'axios';
import { JSDOM } from 'jsdom';

const getImage = (
  doc: Document,
  domain: string,
  url: string
): string | null => {
  switch (domain) {
    case 'zenn.dev':
      const userName = url.split('/')[3];
      const img = doc.querySelector(`img[alt='${userName}']`);
      if (img) return img.getAttribute('src');
      break;
  }

  // Use twitter card image by default
  const twitterCard = doc.querySelector("meta[name='twitter:image']");
  if (twitterCard) {
    const content = twitterCard.getAttribute('content');
    if (content) return content;
  }

  return null;
};

const getDescription = (
  metaTags: HTMLCollectionOf<HTMLMetaElement>,
  domain: string
): string => {
  switch (domain) {
    case 'zenn.dev':
      const description = metaTags.namedItem('description');
      if (description) {
        const content = description.getAttribute('content');
        if (content) return content;
      }
      break;
  }

  // Use twitter card description by default
  const twitterCard = metaTags.namedItem('twitter:description');
  if (twitterCard) {
    const content = twitterCard.getAttribute('content');
    if (content) return content;
  }

  return '';
};

const getFavicon = (doc: Document, domain: string): string | null => {
  let favicon = doc.querySelector("link[rel='icon']");
  if (!favicon) favicon = doc.querySelector("link[rel='shortcut icon']");
  if (!favicon) return `https://${domain}/favicon.ico`;

  const href = favicon.getAttribute('href');
  if (!href) return `https://${domain}/favicon.ico`;
  return href;
};

export const fetchPageInfo = async (
  url: string
): Promise<Omit<FavRecord, 'id' | 'date'> | null> => {
  const res = await axios
    .get(url)
    .then((res) => res)
    .catch((e) => {
      console.error(`Failed to fetch page (${url}}: ${e})`);
      return null;
    });
  if (!res) return null;

  const contentType = res.headers['content-type'];
  if (!contentType || !contentType.includes('text/html')) {
    console.error(`Content type is not html (${contentType})`);
    return null;
  }

  const { document } = new JSDOM(res.data).window;
  const metaTags = document.getElementsByTagName('meta');

  const title = document.title;
  const domain = new URL(url).hostname;
  let faviconUrl = getFavicon(document, domain);
  const imageUrl = getImage(document, domain, url);
  const description = getDescription(metaTags, domain);

  // if favicon is relative path, convert it to absolute path
  if (faviconUrl && !faviconUrl.startsWith('http')) {
    const urlObj = new URL(url);
    faviconUrl = `${urlObj.protocol}//${urlObj.hostname}${faviconUrl}`;
  }

  return {
    url,
    title,
    domain,
    faviconUrl,
    imageUrl,
    description,
  };
};