"use client";

import { useContext } from "react";

import { ToolbarContext } from "@/components/editor/context/toolbar-context";

export function useToolbarContext() {
  return useContext(ToolbarContext);
}
