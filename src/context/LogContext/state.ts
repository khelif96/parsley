import { useReducer } from "react";
import { LogTypes } from "constants/enums";
import { processResmokeLine } from "utils/resmoke";
import { DIRECTION, SearchState } from "./types";

interface LogState {
  logs: string[];
  fileName?: string;
  logType?: LogTypes;
  lineNumber?: number;
  searchState: SearchState;
}

type Action =
  | { type: "INGEST_LOGS"; logs: string[]; logType: LogTypes }
  | { type: "CLEAR_LOGS" }
  | { type: "SET_FILE_NAME"; fileName: string }
  | { type: "SET_SEARCH_TERM"; searchTerm: string }
  | { type: "SET_CASE_SENSITIVE"; caseSensitive: boolean }
  | { type: "SCROLL_TO_LINE"; lineNumber: number }
  | { type: "SET_MATCH_COUNT"; matchCount: number }
  | { type: "PAGINATE"; direction: DIRECTION };

const initialState = (initialLogLines?: string[]): LogState => ({
  logs: initialLogLines || [],
  searchState: {
    searchIndex: 0,
    searchRange: 0,
    hasSearch: false,
    caseSensitive: false,
  },
});

const reducer = (state: LogState, action: Action): LogState => {
  switch (action.type) {
    case "INGEST_LOGS": {
      let processedLogs = action.logs;
      switch (action.logType) {
        case LogTypes.RESMOKE_LOGS:
          processedLogs = action.logs.map(processResmokeLine);
          break;
        default:
          break;
      }
      return {
        ...state,
        logs: processedLogs,
        logType: action.logType,
      };
    }
    case "CLEAR_LOGS":
      return initialState([]);
    case "SET_FILE_NAME":
      return {
        ...state,
        fileName: action.fileName,
      };
    case "SET_SEARCH_TERM": {
      const hasSearch = !!action.searchTerm;
      const searchTerm = new RegExp(
        action.searchTerm,
        state.searchState.caseSensitive ? "" : "i"
      );
      return {
        ...state,
        searchState: {
          ...state.searchState,
          searchTerm: hasSearch ? searchTerm : undefined,
          searchIndex: undefined,
          searchRange: undefined,
          hasSearch,
        },
      };
    }
    case "SET_CASE_SENSITIVE": {
      const { searchTerm } = state.searchState;
      if (!searchTerm) {
        return {
          ...state,
          searchState: {
            ...state.searchState,
            caseSensitive: action.caseSensitive,
          },
        };
      }
      const newSearchTerm = new RegExp(
        searchTerm.source,
        action.caseSensitive ? "" : "i"
      );
      return {
        ...state,
        searchState: {
          searchTerm: newSearchTerm,
          searchIndex: undefined,
          searchRange: undefined,
          hasSearch: true,
          caseSensitive: action.caseSensitive,
        },
      };
    }
    case "SET_MATCH_COUNT":
      return {
        ...state,
        searchState: {
          ...state.searchState,
          searchRange: action.matchCount ? action.matchCount : undefined,
          searchIndex: action.matchCount ? 0 : undefined,
        },
      };
    case "PAGINATE": {
      const { searchIndex, searchRange } = state.searchState;
      if (searchRange !== undefined && searchIndex !== undefined) {
        let nextPage = searchIndex;
        if (action.direction === DIRECTION.NEXT) {
          if (searchIndex + 1 < searchRange) {
            nextPage += 1;
          } else {
            nextPage = 0;
          }
        } else if (searchIndex - 1 < 0) {
          nextPage = searchRange - 1;
        } else {
          nextPage -= 1;
        }
        return {
          ...state,
          searchState: {
            ...state.searchState,
            searchIndex: nextPage,
          },
        };
      }
      return state;
    }
    case "SCROLL_TO_LINE":
      return {
        ...state,
        lineNumber: action.lineNumber,
      };
    default:
      throw new Error(`Unknown reducer action ${action}`);
  }
};

const useLogState = (initialLogLines?: string[]) => {
  const [state, dispatch] = useReducer(reducer, initialState(initialLogLines));
  return {
    state,
    dispatch,
  };
};

export default useLogState;
