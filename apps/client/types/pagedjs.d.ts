declare module 'pagedjs' {
  /** A stylesheet URL, or `{ [baseUrl]: cssText }` for inline CSS. */
  export type PagedStylesheet = string | Record<string, string>;

  export class Handler {
    constructor(chunker: unknown, polisher: unknown, caller: unknown);
  }

  /** Handler classes Paged.js instantiates for every preview. */
  export const registeredHandlers: Array<typeof Handler>;

  export function registerHandlers(...handlers: Array<typeof Handler>): void;

  export class Previewer {
    polisher: { destroy(): void };
    preview(
      content: string,
      stylesheets: PagedStylesheet[],
      renderTo: Element,
    ): Promise<{ total: number }>;
  }
}
