import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Review } from "./mock-data";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ScanRecord {
  productId: string;
  scannedAt: string;
  isFavorite: boolean;
}

interface ScanHistoryState {
  scans: ScanRecord[];
  userReviews: Review[];
  isLoaded: boolean;
}

type ScanHistoryAction =
  | { type: "LOAD"; scans: ScanRecord[]; reviews: Review[] }
  | { type: "ADD_SCAN"; productId: string }
  | { type: "TOGGLE_FAVORITE"; productId: string }
  | { type: "ADD_REVIEW"; review: Review }
  | { type: "REMOVE_REVIEW"; reviewId: string };

interface ScanHistoryContextValue extends ScanHistoryState {
  addScan: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  addReview: (review: Review) => void;
  removeReview: (reviewId: string) => void;
  isFavorite: (productId: string) => boolean;
}

// ─── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: ScanHistoryState, action: ScanHistoryAction): ScanHistoryState {
  switch (action.type) {
    case "LOAD":
      return { ...state, scans: action.scans, userReviews: action.reviews, isLoaded: true };
    case "ADD_SCAN": {
      const existing = state.scans.find((s) => s.productId === action.productId);
      if (existing) {
        // Move to top, update timestamp
        const filtered = state.scans.filter((s) => s.productId !== action.productId);
        return {
          ...state,
          scans: [{ ...existing, scannedAt: new Date().toISOString() }, ...filtered],
        };
      }
      return {
        ...state,
        scans: [
          { productId: action.productId, scannedAt: new Date().toISOString(), isFavorite: false },
          ...state.scans,
        ],
      };
    }
    case "TOGGLE_FAVORITE":
      return {
        ...state,
        scans: state.scans.map((s) =>
          s.productId === action.productId ? { ...s, isFavorite: !s.isFavorite } : s
        ),
      };
    case "ADD_REVIEW": {
      const exists = state.userReviews.some((r) => r.id === action.review.id);
      if (exists) return state;
      return {
        ...state,
        userReviews: [action.review, ...state.userReviews],
      };
    }
    case "REMOVE_REVIEW":
      return {
        ...state,
        userReviews: state.userReviews.filter((r) => r.id !== action.reviewId),
      };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

const ScanHistoryContext = createContext<ScanHistoryContextValue | null>(null);

const STORAGE_KEY_SCANS = "@ecoscan_scans";
const STORAGE_KEY_REVIEWS = "@ecoscan_reviews";

export function ScanHistoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    scans: [],
    userReviews: [],
    isLoaded: false,
  });

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [scansJson, reviewsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_SCANS),
          AsyncStorage.getItem(STORAGE_KEY_REVIEWS),
        ]);
        const scans: ScanRecord[] = scansJson ? JSON.parse(scansJson) : [];
        const reviews: Review[] = reviewsJson ? JSON.parse(reviewsJson) : [];
        dispatch({ type: "LOAD", scans, reviews });
      } catch {
        dispatch({ type: "LOAD", scans: [], reviews: [] });
      }
    })();
  }, []);

  // Persist scans whenever they change
  useEffect(() => {
    if (state.isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY_SCANS, JSON.stringify(state.scans));
    }
  }, [state.scans, state.isLoaded]);

  // Persist reviews whenever they change
  useEffect(() => {
    if (state.isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(state.userReviews));
    }
  }, [state.userReviews, state.isLoaded]);

  const addScan = useCallback((productId: string) => {
    dispatch({ type: "ADD_SCAN", productId });
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", productId });
  }, []);

  const addReview = useCallback((review: Review) => {
    dispatch({ type: "ADD_REVIEW", review });
  }, []);

  const removeReview = useCallback((reviewId: string) => {
    dispatch({ type: "REMOVE_REVIEW", reviewId });
  }, []);

  const isFavorite = useCallback(
    (productId: string) => {
      return state.scans.find((s) => s.productId === productId)?.isFavorite ?? false;
    },
    [state.scans]
  );

  return (
    <ScanHistoryContext.Provider
      value={{ ...state, addScan, toggleFavorite, addReview, removeReview, isFavorite }}
    >
      {children}
    </ScanHistoryContext.Provider>
  );
}

export function useScanHistory(): ScanHistoryContextValue {
  const ctx = useContext(ScanHistoryContext);
  if (!ctx) throw new Error("useScanHistory must be used within ScanHistoryProvider");
  return ctx;
}
