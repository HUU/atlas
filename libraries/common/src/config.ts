import * as _ from 'radashi';
import { z } from 'zod';
import { GlobalSingleton } from './globals';

class ConfigProvider {
  private globalSchema?: z.AnyZodObject;
  private actualConfig?: object;
  private readonly alreadyBoundFor: z.ZodTypeAny[] = [];

  readerFor<T extends z.ZodTypeAny>(
    schema: T,
  ): z.infer<T> & { bindTo: (data: unknown) => void; schema: T } {
    /* eslint-disable @typescript-eslint/no-unsafe-return -- proxy blindly accesses underlying config which is type-checked at the actual call site where this value get used */
    return new Proxy(
      {},
      {
        get: (_, key) => {
          if (key === 'bindTo') {
            /* the reason for exposing bindTo on the proxy: without this, implementers
               must import CONFIG_PROVIDER and call bindTo, however they probably
               defined their config schema in a different "universal import safe"
               module and can't bind there because then you bring in dotenv or
               server(nodejs) stuff like process. Hence when you go to bind, the
               schema has probably not been registered and the system explodes.
               This allows you to import the finalized config object and call bind
               on that ensuring finalizeSchema has happened without "side effect" imports. 
               just to register the schema before hand. */
            return (data: unknown): void => {
              Reflect.get(this, key).bind(this)(schema, data);
            };
          } else if (key === 'schema') {
            return schema;
          } else {
            if (
              !this.alreadyBoundFor.includes(schema) &&
              typeof process === 'object'
            ) {
              // just in time binding ensures we don't need  to inject a bindTo call very early in server startup
              // which is almost impossible with modern frameworks (Nitro/Vinxi). Not support in the browser
              // obviously since it uses environment variables.
              this.bindTo(schema, envNamesToConfigNames(process.env));
            }

            if (this.actualConfig == null) {
              throw new Error(
                'App config read before being bound to a source. Call `bindTo` earlier in the application.',
              );
            } else {
              return Reflect.get(this.actualConfig, key);
            }
          }
        },
      },
    ) as z.infer<T>;
    /* eslint-enable @typescript-eslint/no-unsafe-return */
  }

  partialSchema<T extends z.ZodRawShape>(schemaFields: T): z.ZodObject<T> {
    const schema = z.object({}).extend(schemaFields);
    return schema;
  }

  finalizeSchema<T extends z.ZodRawShape>(
    schemaGenerator: (
      schemaBuilder: Pick<
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- hacky trick to extract subset of ZodObject used for merging schemas
        z.ZodObject<{}, 'strip', z.ZodTypeAny, {}, {}>,
        'merge' | 'extend'
      >,
    ) => z.ZodObject<T>,
  ): z.infer<z.ZodObject<T>> & {
    bindTo: (data: unknown) => void;
    schema: z.ZodObject<T>;
  } {
    const schema = schemaGenerator(z.object({}));
    this.globalSchema = schema;
    return this.readerFor(schema);
  }

  bindTo<T extends z.ZodTypeAny>(schema: T, data: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- type checking is performed by Zod parser
    this.actualConfig = { ...this.actualConfig, ...schema.parse(data) }; // this implicitly populates defaults too
    this.alreadyBoundFor.push(schema);
  }
}

export const { value: CONFIG_PROVIDER } = new GlobalSingleton(
  'CONFIG_PROVIDER',
  () => new ConfigProvider(),
);

export function envNamesToConfigNames(
  blob: NodeJS.ProcessEnv,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(blob)) {
    result[_.camel(key)] = value;
  }
  return result;
}

export function assertConfigIsValidOrThrow<T extends z.ZodRawShape>(
  configReader: { schema: z.ZodObject<T> },
  blob: NodeJS.ProcessEnv,
  options?: { errorMessage?: string },
): void {
  const { error } = configReader.schema.safeParse(envNamesToConfigNames(blob));

  if (error) {
    const issueSummary = _.objectify(
      error.issues,
      (issue) => issue.path.join('.'),
      (issue) => issue.message,
    );
    const keyColumnSize =
      Math.max(...Object.keys(issueSummary).map((k) => k.length)) + 1;

    throw new Error(
      (options?.errorMessage ?? 'Configuration does not parse correctly.') +
        '\n' +
        Object.entries(issueSummary)
          .map(
            ([key, errorMessage]) =>
              `- ${key.padEnd(keyColumnSize)}: ${errorMessage}`,
          )
          .join('\n'),
    );
  }
}
