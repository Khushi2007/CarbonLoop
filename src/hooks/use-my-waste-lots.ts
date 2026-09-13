"use client";

import { useEffect, useState } from "react";

import type { WasteLotListItem } from "./use-waste-lots";

export type MyWasteLotsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; wasteLots: WasteLotListItem[] };

/** Fetches only the authenticated user's own waste lots via GET /api/waste-lots/mine — ownership is resolved server-side, never client-supplied. */
export function useMyWasteLots(): MyWasteLotsState {
  const [state, setState] = useState<MyWasteLotsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/waste-lots/mine");
        const body = await response.json();
        if (!response.ok) {
          throw new Error(typeof body?.error === "string" ? body.error : `Request failed (${response.status})`);
        }
        if (!cancelled) setState({ status: "success", wasteLots: body.wasteLots as WasteLotListItem[] });
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unable to load your waste lots.",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
