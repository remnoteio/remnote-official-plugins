import * as R from "react";

enum FetchDataActionType {
  INIT = "INIT",
  ERROR = "ERROR",
  DONE = "DONE",
}

type FetchDataAction<T> =
  | { type: FetchDataActionType.INIT }
  | { type: FetchDataActionType.ERROR; message: string }
  | { type: FetchDataActionType.DONE; payload: T };

type FetchDataState<T> = { response: T; isLoading: boolean; isError: boolean };

export function apiReducer<T>(
  prevState: FetchDataState<T>,
  action: FetchDataAction<T>
): FetchDataState<T> {
  switch (action.type) {
    case FetchDataActionType.INIT:
      return { ...prevState, isLoading: true, isError: false };
    case FetchDataActionType.ERROR:
      console.log(action.message);
      return { ...prevState, isError: true };
    case FetchDataActionType.DONE:
      return { ...prevState, response: action.payload, isLoading: false };
    default:
      throw new Error("apiReducer: Unknown state...");
  }
}

type Reducer<S, A> = (prevState: S, action: A) => S;

type ApiReducer<T> = Reducer<FetchDataState<T>, FetchDataAction<T>>;

/**
 * A custom hook for getting data from an API.
 * Returns whether the response is loading, whether
 * there was an error, and the response.
 */
export function useFetch<T>(
  url: string | null,
  initialData: T
): FetchDataState<T> {
  const initialState = {
    response: initialData,
    isLoading: false,
    isError: false,
  };
  const [{ response, isLoading, isError }, dispatch] = R.useReducer<
    ApiReducer<T>
  >(apiReducer, initialState);

  R.useEffect(() => {
    if (!url) {
      return;
    }
    const controller = new AbortController();
    const getAndSetData = async () => {
      dispatch({ type: FetchDataActionType.INIT });
      const response = await fetch(url, { signal: controller.signal });
      const json = await response.json();
      dispatch({ type: FetchDataActionType.DONE, payload: json });
    };

    getAndSetData().catch((e) => {
      const msg =
        e instanceof Error ? e.message : `Error fetching data from ${url}.`;
      dispatch({ type: FetchDataActionType.ERROR, message: msg });
    });

    return () => controller.abort();
  }, [url]);

  return { response, isLoading, isError };
}
