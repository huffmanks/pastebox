import type { LexicalEditor } from "lexical";
import { type JSX } from "react";

import { ToolbarContext } from "@/components/editor/context/toolbar-context";

export function ToolbarProvider({
  activeEditor,
  $updateToolbar,
  blockType,
  setBlockType,
  showModal,
  children,
}: {
  activeEditor: LexicalEditor;
  $updateToolbar: () => void;
  blockType: string;
  setBlockType: (blockType: string) => void;
  showModal: (title: string, showModal: (onClose: () => void) => JSX.Element) => void;
  children: React.ReactNode;
}) {
  return (
    <ToolbarContext.Provider
      value={{
        activeEditor,
        $updateToolbar,
        blockType,
        setBlockType,
        showModal,
      }}>
      {children}
    </ToolbarContext.Provider>
  );
}
