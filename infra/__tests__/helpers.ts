import type * as pulumi from '@pulumi/pulumi';

export async function crackOpen<T>(output: pulumi.Output<T>): Promise<T> {
  // @ts-expect-error -- hacking my way into non-public internals
  return await output.promise();
}

export function resourceType<T extends pulumi.Resource>(
  object: new (..._: any) => T,
): string {
  // @ts-expect-error -- hacking my way into non-public internals
  return object.__pulumiType;
}
