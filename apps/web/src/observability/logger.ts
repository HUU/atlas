import { type Attributes, trace } from '@opentelemetry/api';
import adze, {
  Formatter,
  type LevelConfiguration,
  Middleware,
  type ModifierData,
  setup,
  StandardFormatter,
} from 'adze';
import type { Configuration } from 'adze/dist/configuration';
import { crush, pick } from 'radashi';

const GCP_LOGGING_OPERATION_KEY = 'logging.googleapis.com/operation';

type GcpLogSeverity =
  | 'EMERGENCY'
  | 'ALERT'
  | 'CRITICAL'
  | 'ERROR'
  | 'WARNING'
  | 'NOTICE'
  | 'INFO'
  | 'DEBUG'
  | 'DEFAULT';

class GoogleCloudMonitoringFormatter extends Formatter {
  private readonly _fallbackFormatter: StandardFormatter;

  constructor(cfg: Configuration, level: LevelConfiguration) {
    super(cfg, level);
    this._fallbackFormatter = new StandardFormatter(cfg, level);
  }

  protected mapLogLevelToGcpLogSeverity(logLevel: number): GcpLogSeverity {
    switch (logLevel) {
      case 0: // 'alert'
        return 'ALERT';
      case 1: // 'error'
        return 'ERROR';
      case 2: // 'warn'
        return 'WARNING';
      case 3: // 'info'
      case 4: // 'fail'
      case 5: // 'fail'
        return 'INFO';
      case 6: // 'log'
        return 'DEFAULT';
      case 7: // 'debug'
      case 8: // 'verbose'
        return 'DEBUG';
      default:
        return 'DEFAULT';
    }
  }

  protected formatBrowser(
    data: ModifierData,
    timestamp: string,
    args: unknown[],
  ): unknown[] {
    return this._fallbackFormatter.print(data, timestamp, args);
  }
  protected formatServer(
    data: ModifierData,
    timestamp: string,
    args: unknown[],
  ): unknown[] {
    const message = args.shift();
    // https://cloud.google.com/logging/docs/agent/logging/configuration#special-fields
    const jsonLog = {
      severity: this.mapLogLevelToGcpLogSeverity(this.level.level),
      message,
      timestamp,
      ...(data.namespace
        ? {
            [GCP_LOGGING_OPERATION_KEY]: {
              id: data.namespace.join('::'),
              producer: this.cfg.meta.name,
            },
          }
        : {}),
      args,
    };

    return [JSON.stringify(jsonLog)];
  }
}

class OpenTelemetrySpanMiddleware extends Middleware {
  constructor() {
    super('server');
  }

  protected convertToSafeAttributes(obj: object): Attributes {
    // Removes GCP_LOGGING_OPERATION_KEY, then recursively crushes log data i.e
    // args[0].name = 'hello' becomes 'args.0.name': 'hello' and finally removes
    // anything left that isn't a bool/number/string as demanded by OTel
    return pick(
      crush(pick(obj, (_, key) => key !== GCP_LOGGING_OPERATION_KEY)),
      (value) => ['string', 'boolean', 'number'].includes(typeof value),
    );
  }

  beforeTerminated(log: adze): void {
    /* @ts-expect-error -- hacking my way into internals */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- no
    const spanName: string | undefined = trace.getActiveSpan()?.name;
    if (spanName) {
      log.ns(spanName);
    }
  }

  afterTerminated(log: adze): void {
    if (log.data) {
      let attributes: Attributes = {};
      if (log.data.format === 'gcp') {
        attributes = this.convertToSafeAttributes(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-type-assertion -- message array is of a known type and structure from GoogleCloudMonitoringFormatter
          JSON.parse(log.data.message[0] as string),
        );
      } else {
        attributes = { message: log.data.message.join(' ') };
      }

      trace
        .getActiveSpan()
        ?.addEvent(`logged-${log.data.levelName}`, attributes, Date.now());
    }
  }
}

// Set our active level to 'info' which is equivalent to 3
setup({
  activeLevel: 'info',
  middleware: [new OpenTelemetrySpanMiddleware()],
  formatters: {
    gcp: GoogleCloudMonitoringFormatter,
  },
  format:
    import.meta.env.NODE_ENV === 'production' || import.meta.env.PROD
      ? 'gcp'
      : 'pretty',
  meta: {
    name: 'com.huu.atlas',
  },
});

export const logger = adze.withEmoji.timestamp.seal();
