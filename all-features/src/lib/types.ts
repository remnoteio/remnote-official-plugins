import { RNPlugin, Rem } from "@remnote/plugin-sdk";

export type JustMethods<ObjectType> = Pick<
  ObjectType,
  {
    [Method in keyof ObjectType]: ObjectType[Method] extends (
      ...args: unknown[]
    ) => unknown
      ? Method
      : never;
  }[keyof ObjectType]
>;

export interface TestResult {
  expected: any;
  actual: any;
}

export type TestResultMap<T> = {
  [K in keyof Omit<JustMethods<T>, 'call' | '_call'>]: (
    plugin: RNPlugin,
    removeRem: (...rem: (Rem | undefined)[]) => Promise<void>
  ) => Promise<TestResult>;
};
