'use client';

import { type Previewer } from 'pagedjs';
import { type CSSProperties, useEffect, useRef } from 'react';

import { type ResumeData } from '@/components/templates/resume.types';
import { ResumeDocument } from '@/components/templates/resume-document';
import { type Format } from '@/stores/features/template.slice';

/** Marks the template's root element in the copy handed to Paged.js. */
const ROOT_ATTR = 'data-resume-root';
/** Marks the element holding side-by-side columns in that copy. */
const COLUMNS_ATTR = 'data-paged-columns';
/** Marks each of those columns (by index). */
const COLUMN_ATTR = 'data-paged-column';
/** Marks avoid blocks too tall to keep whole in that copy (see annotate). */
const TALL_ATTR = 'data-paged-tall';
/** A4 height at 96dpi. */
const PAGE_HEIGHT_PX = (297 / 25.4) * 96;
const HEADINGS = 'h1, h2, h3, h4, h5, h6';
/** Room left at the foot of each page for print's taller text layout. */
const PRINT_SLACK_PX = 24;
const SOURCE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: -10000,
  height: 0,
  overflow: 'hidden',
  visibility: 'hidden',
};
/** Typing in the builder re-paginates once the user pauses. */
const DEBOUNCE_MS = 300;

interface PageMargins {
  top: number;
  bottom: number;
}

/**
 * Templates pad themselves to A4. Paged.js drops an element's padding where it
 * splits, so the vertical padding becomes the page margin instead: every page
 * gets the bottom one, continuation pages the top one. Sidebar templates pad
 * their columns rather than the root.
 */
function pageMargins(root: Element): PageMargins {
  const blocks = [root, ...Array.from(root.children)];
  const edge = (side: 'paddingTop' | 'paddingBottom') =>
    Math.max(
      ...blocks.map((block) => parseFloat(getComputedStyle(block)[side]) || 0),
    );
  return { top: edge('paddingTop'), bottom: edge('paddingBottom') };
}

function pageCss({ top, bottom }: PageMargins) {
  // Lengths need units: Paged.js puts them inside calc()
  return `
    @page {
      size: 210mm 297mm;
      margin: ${top}px 0px ${bottom}px 0px;
    }
    @page :first { margin-top: 0px; }
    .pagedjs_page_content > div > div { height: 100%; }
    [${ROOT_ATTR}] {
      min-height: 100% !important;
      padding-bottom: 0 !important;
    }
  `;
}

/** A grid laid out as one row of columns, e.g. a two-column body. */
function isColumnGrid(element: Element) {
  const style = getComputedStyle(element);
  if (style.display !== 'grid') return false;
  const tracks = style.gridTemplateColumns.split(' ').length;
  return tracks >= 2 && element.children.length === tracks;
}

/**
 * Notes on the copy what only the laid-out source can tell:
 *
 * - Columns of a column grid are pinned to their tracks, so a column carried
 *   onto the next page alone stays in its own track.
 * - `break-inside: avoid` blocks taller than half a page are marked to break
 *   like any other block: one taller than a page can't be kept whole, and
 *   keeping a long one (a full summary) whole would leave most of the
 *   previous page empty. Entries (a job, a project) stay whole.
 */
function annotate(root: Element, copyRoot: Element, pageHeight: number) {
  const copies = copyRoot.querySelectorAll<HTMLElement>('*');
  root.querySelectorAll<HTMLElement>('*').forEach((element, index) => {
    const copy = copies[index]!;
    if (isColumnGrid(element)) {
      Array.from(copy.children).forEach((child, track) => {
        (child as HTMLElement).style.gridColumn = String(track + 1);
      });
    }
    if (
      getComputedStyle(element).breakInside === 'avoid' &&
      element.offsetHeight > pageHeight / 2
    ) {
      copy.setAttribute(TALL_ATTR, '');
    }
  });
}

/**
 * The element holding side-by-side columns: the root of a sidebar (flex row)
 * template, or a column grid closing the root (a two-column body under a
 * header).
 */
function findColumns(root: Element) {
  const { display, flexDirection } = getComputedStyle(root);
  if (display === 'flex' && flexDirection === 'row') return root;
  const last = Array.from(root.children)
    .filter((child) => getComputedStyle(child).position !== 'absolute')
    .at(-1);
  return last && isColumnGrid(last) ? last : undefined;
}

const TRANSPARENT = /^(transparent|rgba\(.*,\s*0\))$/;

/**
 * A sidebar template's colored columns as a page background (CSS
 * `background-image`), or '' for any other template.
 *
 * The columns only fill each page's content box: the vertical padding became
 * the page margin (see pageMargins), and print leaves some slack at the foot,
 * so a dark sidebar would stop short of the sheet's top and bottom edges.
 * Painted on the page itself, at the column's measured position and color
 * (accent applied), it runs edge to edge.
 */
function sidebarBackdrop(root: Element) {
  const { display, flexDirection } = getComputedStyle(root);
  if (display !== 'flex' || flexDirection !== 'row') return '';

  const left = root.getBoundingClientRect().left;
  return Array.from(root.children)
    .flatMap((column) => {
      const { backgroundColor: color, position } = getComputedStyle(column);
      if (position === 'absolute' || TRANSPARENT.test(color)) return [];
      const box = column.getBoundingClientRect();
      const from = box.left - left;
      const to = from + box.width;
      return [
        `linear-gradient(to right, transparent ${from}px, ${color} ${from}px, ${color} ${to}px, transparent ${to}px)`,
      ];
    })
    .join(', ');
}

/**
 * Builds the HTML handed to Paged.js from the laid-out template.
 *
 * - Absolutely positioned art on the root (corner patterns) isn't flow
 *   content, but Paged.js tries to fit it like text and loops on art pinned
 *   to the bottom. It's taken out and put back on the first page, or the last
 *   one when pinned to the bottom.
 * - Paged.js lays content out in DOM order, so the second of two side-by-side
 *   columns would only start once the first one ended, pages later. Such
 *   templates get one copy per column (the rest of the template stays, so
 *   both start at the same height), each paginated on its own at its real
 *   width and merged back (see `mergeColumns`).
 */
function prepareContent(root: Element, pageHeight: number) {
  const wrapper = root.parentElement!.cloneNode(true) as Element;
  const copyRoot = wrapper.firstElementChild!;
  // Only the copy is marked: the page rules aimed at it would otherwise also
  // strip the source's padding and skew the next run's margins
  copyRoot.setAttribute(ROOT_ATTR, '');
  // Paged.js waits for every image; lazy ones off-screen would never load
  wrapper.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
  annotate(root, copyRoot, pageHeight);

  const container = findColumns(root);
  let columns = 0;
  if (container) {
    const copyContainer =
      container === root
        ? copyRoot
        : copyRoot.children[Array.from(root.children).indexOf(container)]!;
    copyContainer.setAttribute(COLUMNS_ATTR, '');
    Array.from(container.children).forEach((column, index) => {
      if (getComputedStyle(column).position === 'absolute') return;
      const copy = copyContainer.children[index] as HTMLElement;
      // Keeps its width when paginated alone (see the stage rule for grids)
      copy.style.flex = 'none';
      copy.style.width = `${(column as HTMLElement).offsetWidth}px`;
      copy.setAttribute(COLUMN_ATTR, String(columns++));
    });
  }

  const copies = Array.from(copyRoot.children);
  const decorations: Array<{ html: string; atBottom: boolean }> = [];
  Array.from(root.children).forEach((child, index) => {
    const style = getComputedStyle(child);
    if (style.position !== 'absolute') return;
    decorations.push({ html: child.outerHTML, atBottom: style.top === 'auto' });
    copies[index]!.remove();
  });

  if (columns < 2) return { contents: [wrapper.outerHTML], decorations };
  const contents = Array.from({ length: columns }, (_, column) => {
    const copy = wrapper.cloneNode(true) as Element;
    copy
      .querySelectorAll(`[${COLUMNS_ATTR}] > [${COLUMN_ATTR}]`)
      .forEach((other) => {
        if (other.getAttribute(COLUMN_ATTR) !== String(column)) other.remove();
      });
    return copy.outerHTML;
  });
  return { contents, decorations };
}

/**
 * Puts columns paginated on their own back side by side: page n gets each
 * column's n-th piece, or an empty copy of the column (same width and
 * background) once that column has ended. Returns the merged pages' roots.
 */
function mergeColumns(flows: Element[][]) {
  const columns = (root: Element | undefined) =>
    root?.matches(`[${COLUMNS_ATTR}]`)
      ? root
      : root?.querySelector(`:scope > [${COLUMNS_ATTR}]`);
  const piece = (root: Element | undefined) =>
    columns(root)?.querySelector(`:scope > [${COLUMN_ATTR}]`);
  const blanks = flows.map((roots) =>
    piece(roots.find((root) => piece(root)))!.cloneNode(false),
  );
  const shell = columns(flows.flat().find((root) => columns(root)))!;
  const base = flows.reduce((most, roots) =>
    roots.length > most.length ? roots : most,
  );

  base.forEach((root, page) => {
    const pieces = flows.map((roots) => piece(roots[page]));
    if (pieces.every((found) => !found)) return;
    // The base column may start a page later than another (e.g. pushed past
    // the header); its page then gets the container so no piece is dropped
    let container = columns(root);
    if (!container) {
      container = shell.cloneNode(false) as Element;
      root.append(container);
    }
    container.replaceChildren(
      ...pieces.map((found, index) => found ?? blanks[index]!.cloneNode(false)),
    );
  });
  return base;
}

/**
 * Adjusts where Paged.js breaks the page:
 *
 * - Paged.js 0.4 only honors `break-inside: avoid` on a block that starts past
 *   the page end; one that straddles it still gets cut. The break moves
 *   before the innermost avoid block holding the overflow instead (an entry
 *   rather than its whole section), unless it already starts the page.
 * - When the break falls right before a section's first entry, the section
 *   title goes along rather than ending the page alone.
 */
function adjustBreak(overflow: Range | undefined, rendered: Element) {
  if (!overflow) return;
  // Moving the break before something that already starts the page would
  // hand Paged.js the same start again, and it would repeat the content
  const followsContent = (el: Element | null | undefined) => {
    if (!el) return false;
    const before = document.createRange();
    before.setStart(rendered, 0);
    before.setEndBefore(el);
    return (
      before.toString().trim() !== '' ||
      !!before.cloneContents().querySelector('img')
    );
  };

  let block: Element | undefined;
  for (
    let node: Node | null = overflow.startContainer;
    node && node !== rendered;
    node = node.parentNode
  ) {
    if (
      node instanceof Element &&
      !node.hasAttribute(TALL_ATTR) &&
      getComputedStyle(node).breakInside === 'avoid' &&
      followsContent(node)
    ) {
      block = node;
      break;
    }
  }
  const { startContainer, startOffset } = overflow;
  // Otherwise only a break between elements can be one before an entry
  if (!block && startContainer instanceof Element) {
    const next = startContainer.childNodes[startOffset];
    if (next instanceof Element) block = next;
  }
  if (!block) return;

  let first: Element = block;
  while (first.parentElement?.firstElementChild === first) {
    first = first.parentElement;
  }
  // A heading, or a wrapper holding nothing but one (an icon at most)
  const title = first.previousElementSibling;
  const heading = title?.matches(HEADINGS)
    ? title
    : title?.querySelector(HEADINGS);
  if (
    title &&
    heading &&
    heading.textContent?.trim() === title.textContent?.trim() &&
    followsContent(title)
  ) {
    block = title;
  }

  const range = overflow.cloneRange();
  range.setStartBefore(block);
  return range;
}

let pagedjsPromise: Promise<typeof Previewer> | null = null;

function loadPreviewer() {
  pagedjsPromise ??= import('pagedjs').then((pagedjs) => {
    // These rewrite :nth-of-type and sibling selectors by splitting on every
    // comma, which breaks on the typography plugin's `:where(a, b)`
    // selectors. The browser applies those rules natively anyway.
    const skipped = new Set(['NthOfType', 'Following']);
    const handlers = pagedjs.registeredHandlers;
    for (let i = handlers.length - 1; i >= 0; i--) {
      if (skipped.has(handlers[i]!.name)) handlers.splice(i, 1);
    }

    pagedjs.registerHandlers(
      class AdjustBreak extends pagedjs.Handler {
        onOverflow(overflow: Range | undefined, rendered: Element) {
          return adjustBreak(overflow, rendered);
        }
      },
    );
    return pagedjs.Previewer;
  });
  return pagedjsPromise;
}

interface PagedResumeProps {
  templateKey: string | null | undefined;
  resume: ResumeData;
  format?: Partial<Format> | null;
  /** Called after each pagination with the number of pages. */
  onRendered?: (pages: number) => void;
}

/**
 * Renders a template split into real A4 pages with Paged.js, as in
 * resume-pdf-mvp. The builder previews and the /print route (the PDF source)
 * both use it, so the download breaks pages exactly like the preview.
 */
export function PagedResume({
  templateKey,
  resume,
  format,
  onRendered,
}: PagedResumeProps) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const onRenderedRef = useRef(onRendered);
  onRenderedRef.current = onRendered;

  // Runs can't be cancelled, so they go one after another; each reads the
  // source as it is when it starts, so the latest edit wins.
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const previewersRef = useRef<Previewer[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      queueRef.current = queueRef.current
        .then(async () => {
          const target = targetRef.current;
          const root = sourceRef.current?.firstElementChild?.firstElementChild;
          if (!target || !root) return;

          await document.fonts.ready;
          const margins = pageMargins(root);
          const css = pageCss(margins);
          const backdrop = sidebarBackdrop(root);
          const { contents, decorations } = prepareContent(
            root,
            PAGE_HEIGHT_PX - margins.top - margins.bottom - PRINT_SLACK_PX,
          );
          const PagedPreviewer = await loadPreviewer();

          // Laid out off-screen at full size (the builder preview is scaled
          // down), then moved in, so the old pages stay up meanwhile
          const runs: Array<{ previewer: Previewer; stage: HTMLElement }> = [];
          let pages: number;
          try {
            for (const content of contents) {
              const stage = document.createElement('div');
              stage.className = 'paged-resume-stage';
              stage.style.cssText =
                'position:fixed;top:0;left:-10000px;visibility:hidden';
              document.body.append(stage);
              const previewer = new PagedPreviewer();
              runs.push({ previewer, stage });
              const flow = await previewer.preview(
                content,
                [{ [window.location.href]: css }],
                stage,
              );

              flow.pages.forEach((page) => page.removeListeners());
            }

            const flows = runs.map(({ stage }) =>
              Array.from(stage.querySelectorAll(`[${ROOT_ATTR}]`)),
            );
            const roots = flows.length > 1 ? mergeColumns(flows) : flows[0]!;
            for (const { html, atBottom } of decorations) {
              roots
                .at(atBottom ? -1 : 0)
                ?.insertAdjacentHTML('afterbegin', html);
            }
            const merged = runs.find(({ stage }) => stage.contains(roots[0]!));
            if (backdrop) {
              merged!.stage
                .querySelectorAll<HTMLElement>('.pagedjs_page')
                .forEach((page) => (page.style.backgroundImage = backdrop));
            }
            target.replaceChildren(...Array.from(merged!.stage.childNodes));
            pages = roots.length;
          } catch (error) {
            runs.forEach(({ previewer }) => previewer.polisher.destroy());
            throw error;
          } finally {
            runs.forEach(({ stage }) => stage.remove());
          }
          previewersRef.current.forEach((old) => old.polisher.destroy());
          previewersRef.current = runs.map(({ previewer }) => previewer);
          onRenderedRef.current?.(pages);
        })
        .catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [templateKey, resume, format]);

  useEffect(
    () => () => previewersRef.current.forEach((old) => old.polisher.destroy()),
    [],
  );

  return (
    <div className='paged-resume'>
      <style>{`
        /* The pages are laid out in a stage on <body>, then shown wherever
           the component sits; the same inherited text styles in both places
           keep lines from rewrapping after the page breaks are set */
        .paged-resume, .paged-resume-stage {
          font-size: 16px;
          line-height: 1.5;
          font-weight: 400;
          font-style: normal;
          letter-spacing: normal;
          word-spacing: normal;
          text-align: left;
          text-transform: none;
          white-space: normal;
          color: #000;
        }
        /* Paged.js lays each page out in CSS columns, so anything past the
           page end moves into a hidden next column. Print measures text a few
           px differently from screen, which would drop the last block of a
           full page from the PDF; once the pages are cut, it can only run
           slightly into the bottom margin instead. */
        .paged-resume .pagedjs_page_content { columns: auto !important; }
        /* A grid column paginated alone (at its measured width) lays out as
           a block: Paged.js can't break inside a grid item and would push
           the whole grid to the next page */
        .paged-resume-stage [${COLUMNS_ATTR}]:not([${ROOT_ATTR}]) {
          display: block !important;
        }
        /* Blocks too tall to keep whole (see annotate); left as avoid, the
           browser would still push them a page and leave their title alone */
        .paged-resume-stage [${TALL_ATTR}] { break-inside: auto !important; }
        /* Print lines up text slightly taller than screen (it adds up over a
           page), so pages are filled a little short of the bottom margin and
           print still fits */
        .paged-resume-stage .pagedjs_page_content {
          height: calc(
            100% - var(--pagedjs-footnotes-height) - ${PRINT_SLACK_PX}px
          ) !important;
        }
        @media screen {
          .paged-resume .pagedjs_pages {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .paged-resume .pagedjs_page {
            background: #fff;
            box-shadow: 0 4px 16px rgb(0 0 0 / 0.12);
          }
        }
      `}</style>
      {/* Laid out (off-screen) rather than display:none, so column widths and
          paddings can be measured */}
      <div ref={sourceRef} data-paged-source aria-hidden style={SOURCE_STYLE}>
        <ResumeDocument
          templateKey={templateKey}
          resume={resume}
          format={format}
        />
      </div>
      <div ref={targetRef} />
    </div>
  );
}
