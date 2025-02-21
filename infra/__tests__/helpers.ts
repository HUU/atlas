import type * as pulumi from '@pulumi/pulumi';

export async function crackOpen<T>(output: pulumi.Output<T>): Promise<T> {
  // @ts-expect-error -- hacking my way into non-public internals
  return await output.promise();
}
