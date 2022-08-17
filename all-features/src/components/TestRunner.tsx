import * as R from "react";
import { usePlugin, Rem } from "@remnote/plugin-sdk";
import { TestResult, TestResultMap } from "../lib/types";
import * as Re from 'remeda'

interface TestRunnerProps {
  tests: TestResultMap<any>;
}

export const TestRunner = (props: TestRunnerProps) => {
  const plugin = usePlugin();
  const [error, setError] = R.useState<string | null>(null);
  const [testJson, setTestJson] = R.useState<Record<string, TestResult>>({});
  const [running, setRunning] = R.useState<boolean>(false);

  const removeRem = async (...rem: (Rem | undefined)[]) => {
    await Promise.all(rem.map((r) => r?.remove()));
  };

  const runTests = async () => {
    setRunning(true);
    let currentTest: string;
    try {
      const results: [string, TestResult][] = [];
      for (const [name, test] of Object.entries(props.tests)) {
        currentTest = name;
        const result = await test(plugin, removeRem);
        results.push([name, result]);
      }
      const obj = Object.fromEntries(results);
      console.log(obj);
      await Promise.all((await plugin.rem.getAll()).map(r => r?.remove()))
      setTestJson(obj);
    } catch (e) {
      const msg = `${currentTest!} test run failed with: ${e}`;
      console.log(msg);
      setError(msg);
      await Promise.all((await plugin.rem.getAll()).map(r => r?.remove()))
    } finally {
      setRunning(false);
    }
  };

  R.useEffect(() => {
    runTests();
  }, []);

  const failedTests = Object.entries(testJson).filter(([k, v]) => !Re.equals(v.actual, v.expected));

  return (
    <>
      {error && <div>{error}</div>}
      <button onClick={() => runTests()} disabled={running}>
        Rerun Tests
      </button>
      {
        failedTests.length > 0 && (
          <div>
          <br/>
          Failed Tests:
          <ol>
          {
            failedTests.map(([k]) => <li key={k}>{k}</li>)
          }
          </ol>
          <br/>
          </div>
        )
      }
      <div className="overflow-y-scroll">
        <pre id="test-output-sidebar">{JSON.stringify(testJson, null, 2)}</pre>
      </div>
    </>
  );
};
