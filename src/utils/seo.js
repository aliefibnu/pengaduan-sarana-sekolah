const DEFAULT_SITE_NAME = "Benerin Dong";
const DEFAULT_DESCRIPTION =
  "Platform untuk melaporkan masalah sarana sekolah dan memantau perbaikannya secara real-time.";
const DEFAULT_IMAGE_PATH = "/og-image.svg";

function getBaseUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

function toAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      element.removeAttribute(key);
      return;
    }

    element.setAttribute(key, value);
  });

  return element;
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      element.removeAttribute(key);
      return;
    }

    element.setAttribute(key, value);
  });

  return element;
}

export function applyRouteSeo(route) {
  const meta = route?.meta || {};
  const title = meta.title || DEFAULT_SITE_NAME;
  const description = meta.description || DEFAULT_DESCRIPTION;
  const robots = meta.robots || "index, follow";
  const canonicalPath = meta.canonical || route?.path || "/";
  const absoluteUrl = toAbsoluteUrl(canonicalPath.split("?")[0]);
  const imageUrl = toAbsoluteUrl(meta.image || DEFAULT_IMAGE_PATH);
  const siteName = meta.siteName || DEFAULT_SITE_NAME;

  document.title = title;
  document.documentElement.lang = meta.lang || "id";

  upsertMeta('meta[name="description"]', {
    name: "description",
    content: description,
  });
  upsertMeta('meta[name="robots"]', {
    name: "robots",
    content: robots,
  });
  upsertMeta('meta[name="theme-color"]', {
    name: "theme-color",
    content: meta.themeColor || "#0369a1",
  });
  upsertMeta('meta[property="og:type"]', {
    property: "og:type",
    content: meta.ogType || "website",
  });
  upsertMeta('meta[property="og:site_name"]', {
    property: "og:site_name",
    content: siteName,
  });
  upsertMeta('meta[property="og:title"]', {
    property: "og:title",
    content: meta.ogTitle || title,
  });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: meta.ogDescription || description,
  });
  upsertMeta('meta[property="og:url"]', {
    property: "og:url",
    content: absoluteUrl,
  });
  upsertMeta('meta[property="og:image"]', {
    property: "og:image",
    content: imageUrl,
  });
  upsertMeta('meta[property="twitter:card"]', {
    property: "twitter:card",
    content: meta.twitterCard || "summary_large_image",
  });
  upsertMeta('meta[property="twitter:title"]', {
    property: "twitter:title",
    content: meta.twitterTitle || title,
  });
  upsertMeta('meta[property="twitter:description"]', {
    property: "twitter:description",
    content: meta.twitterDescription || description,
  });
  upsertMeta('meta[property="twitter:image"]', {
    property: "twitter:image",
    content: imageUrl,
  });

  upsertLink('link[rel="canonical"]', {
    rel: "canonical",
    href: absoluteUrl,
  });
}
