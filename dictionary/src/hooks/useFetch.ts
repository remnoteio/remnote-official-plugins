import * as R from 'react';

enum FetchDataActionType {
  INIT = 'INIT',
  ERROR = 'ERROR',
  DONE = 'DONE',
}

type FetchDataAction<T> =
  | { type: FetchDataActionType.INIT }
  | { type: FetchDataActionType.ERROR; message: string }
  | { type: FetchDataActionType.DONE; payload: T };

type FetchDataState<T> = {
  response: T;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
};

export function apiReducer<T>(
  prevState: FetchDataState<T>,
  action: FetchDataAction<T>,
): FetchDataState<T> {
  switch (action.type) {
    case FetchDataActionType.INIT:
      return {
        ...prevState,
        isLoading: true,
        isError: false,
        errorMessage: null,
      };
    case FetchDataActionType.ERROR:
      return {
        ...prevState,
        isLoading: false,
        isError: true,
        errorMessage: action.message,
      };
    case FetchDataActionType.DONE:
      return {
        response: action.payload,
        isLoading: false,
        isError: false,
        errorMessage: null,
      };
    default:
      throw new Error('apiReducer: Unknown state...');
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
  initialData: T,
): FetchDataState<T> {
  const initialState = {
    response: initialData,
    isLoading: false,
    isError: false,
    errorMessage: null,
  };
  const [state, dispatch] = R.useReducer<ApiReducer<T>>(
    apiReducer,
    initialState,
  );

  R.useEffect(() => {
    if (!url) {
      dispatch({ type: FetchDataActionType.DONE, payload: initialData });
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const getAndSetData = async () => {
      dispatch({ type: FetchDataActionType.INIT });
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok && response.status !== 404) {
        throw new Error(
          `Dictionary API returned HTTP ${response.status} ${response.statusText}.`,
        );
      }
      const json = await response.json();
      if (!cancelled) {
        dispatch({ type: FetchDataActionType.DONE, payload: json });
      }
    };

    getAndSetData()
      .catch((e) => {
        if (!cancelled) {
          const msg = controller.signal.aborted
            ? 'Dictionary lookup timed out.'
            : e instanceof Error
              ? e.message
              : `Error fetching data from ${url}.`;
          dispatch({ type: FetchDataActionType.ERROR, message: msg });
        }
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [url]);

  return state;
}
