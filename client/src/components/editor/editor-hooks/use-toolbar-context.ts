import { ToolbarContext } from "@/components/editor/context/toolbar-context";
import { useContext } from "react";

export function useToolbarContext() {
  return useContext(ToolbarContext);
}
