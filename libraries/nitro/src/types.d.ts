import type { Context, Span } from '@opentelemetry/api';

declare module 'h3' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- augment existing interface
  interface H3Event {
    otel: {
      span: Span;
      endTime?: Date;
      ctx: Context;
      startTime: Date;
    };
  }
}

declare module 'nitropack' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- augment existing interface
  interface NitroOptions {
    gcp?: Partial<{
      /**
       * Glob patterns to include in the server directory for the GCP
       * production container.
       */
      includeFiles: string[];
      /**
       * Exact files to exclude when matching the `includeFiles` glob patterns.
       */
      excludeFiles: string[];
    }>;
  }
}
