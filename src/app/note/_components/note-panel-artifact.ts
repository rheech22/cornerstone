export const NOTE_PANEL_ARTIFACT_VERSION = 1;

export type NotePanelArtifact = {
  html: string;
  slug: string;
  version: typeof NOTE_PANEL_ARTIFACT_VERSION;
};

const hasControlCharacter = (value: string): boolean =>
  [...value].some((character) => {
    const code = character.charCodeAt(0);

    return code <= 0x1f || code === 0x7f;
  });

const BLOCKED_STYLE_PROPERTIES = new Set(['bottom', 'inset', 'left', 'position', 'right', 'top', 'z-index']);
const RESOURCE_ATTRIBUTES = new Set(['poster', 'src']);

const assertSafeStyle = (value: string) => {
  if (/url\s*\(|expression\s*\(|@import/i.test(value)) throw new Error('unsafe note panel artifact style');

  value.split(';').forEach((declaration) => {
    const separator = declaration.indexOf(':');

    if (separator === -1) return;

    const property = declaration.slice(0, separator).trim().toLowerCase();

    if (BLOCKED_STYLE_PROPERTIES.has(property)) throw new Error('unsafe note panel artifact style');
  });
};

const assertSafeUrl = (value: string, attribute: string) => {
  if (hasControlCharacter(value)) throw new Error('unsafe note panel artifact URL');

  const url = new URL(value, window.location.origin);
  const safeLink = attribute === 'href'
    && ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  const safeDataImage = attribute === 'src'
    && url.protocol === 'data:'
    && /^data:image\/(?:avif|gif|jpeg|png|webp);base64,/i.test(value);
  const safeResource = RESOURCE_ATTRIBUTES.has(attribute)
    && ['http:', 'https:'].includes(url.protocol)
    && url.origin === window.location.origin;

  if (!safeLink && !safeDataImage && !safeResource) throw new Error('unsafe note panel artifact URL');
};

const assertSafeSrcSet = (value: string) => {
  let remaining = value.trim();

  while (remaining) {
    let candidate = '';

    if (remaining.toLowerCase().startsWith('data:')) {
      const descriptorStart = remaining.search(/\s/);

      if (descriptorStart === -1) {
        candidate = remaining;
        remaining = '';
      } else {
        candidate = remaining.slice(0, descriptorStart);
        const separator = remaining.indexOf(',', descriptorStart);

        remaining = separator === -1 ? '' : remaining.slice(separator + 1).trim();
      }
    } else {
      const separator = remaining.indexOf(',');
      const entry = separator === -1 ? remaining : remaining.slice(0, separator);

      candidate = entry.trim().split(/\s+/, 1)[0];
      remaining = separator === -1 ? '' : remaining.slice(separator + 1).trim();
    }

    const url = candidate.trim();

    if (!url) throw new Error('unsafe note panel artifact srcset');

    assertSafeUrl(url, 'src');
  }
};

const assertSafeArtifact = (artifact: HTMLElement) => {
  if (artifact.querySelector('script, iframe, object, embed, base, meta, link, style, form, input, textarea, select, option, foreignObject, animate, set, use')) {
    throw new Error('unsafe note panel artifact element');
  }

  artifact.querySelectorAll<HTMLElement>('*').forEach((element) => {
    if (element.tagName === 'BUTTON') {
      const isKnownControl = element.hasAttribute('data-close-slug')
        || element.hasAttribute('data-copy-code')
        || element.hasAttribute('data-fold-slug')
        || element.hasAttribute('data-unfold-slug');

      if (!isKnownControl || element.getAttribute('type') !== 'button') throw new Error('unsafe note panel artifact button');
    }

    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith('on') || ['action', 'autofocus', 'contenteditable', 'formaction', 'ping', 'srcdoc', 'xlink:href'].includes(name)) {
        throw new Error('unsafe note panel artifact attribute');
      }

      if (name === 'style') assertSafeStyle(value);
      if (name === 'srcset') assertSafeSrcSet(value);
      if (name === 'tabindex' && value !== '-1') throw new Error('unsafe note panel artifact tabindex');

      if (['href', 'poster', 'src'].includes(name)) {
        const urlType = name === 'href' && element.namespaceURI === 'http://www.w3.org/2000/svg' && element.tagName.toLowerCase() !== 'a'
          ? 'src'
          : name;

        assertSafeUrl(value, urlType);
      }
    });
  });
};

export const parseNotePanelArtifact = (documentHtml: string, expectedSlug: string): NotePanelArtifact => {
  const document = new DOMParser().parseFromString(documentHtml, 'text/html');
  const artifacts = document.querySelectorAll<HTMLElement>('[data-note-panel-artifact="1"]');

  if (artifacts.length !== 1) throw new Error('invalid note panel artifact marker');

  const artifact = artifacts[0];
  const slug = artifact.dataset.panelSlug;
  const version = Number(artifact.dataset.artifactVersion);
  const panel = artifact.querySelector<HTMLElement>(':scope > .note-panel');

  if (slug !== expectedSlug) throw new Error('note panel artifact slug mismatch');
  if (version !== NOTE_PANEL_ARTIFACT_VERSION) throw new Error('unsupported note panel artifact version');
  if (!panel || panel.dataset.panelSlug !== expectedSlug) throw new Error('invalid note panel artifact content');

  assertSafeArtifact(artifact);

  return { html: panel.outerHTML, slug, version: NOTE_PANEL_ARTIFACT_VERSION };
};

export const fetchNotePanelArtifact = async (slug: string): Promise<NotePanelArtifact> => {
  const response = await fetch(`/note-panel-artifact/${encodeURIComponent(slug)}`);

  if (!response.ok) throw new Error(response.status === 404 ? 'note panel artifact not found' : 'note panel artifact request failed');

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('text/html')) throw new Error('invalid note panel artifact content type');
  if (new URL(response.url).origin !== window.location.origin) throw new Error('invalid note panel artifact origin');

  return parseNotePanelArtifact(await response.text(), slug);
};
