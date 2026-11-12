import { createContext, useContext } from "react";
import type { FocusRoute } from "./route/build";

/** Маршрут, собранный в App, для панелей, которым он нужен целиком. */
export const RouteContext = createContext<FocusRoute | null>(null);

export function useRoute() {
  return useContext(RouteContext);
}
