"use client";

import { useMemo } from "react";

import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { type EditorState, type SerializedEditorState, defineExtension } from "lexical";

import { nodes } from "@/components/editor/blocks/nodes";
import { Plugins } from "@/components/editor/blocks/plugins";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import ReadOnlyToolbar from "@/components/editor/ui/read-only-toolbar";
import { Field } from "@/components/ui/field";
import { TooltipProvider } from "@/components/ui/tooltip";

const appExtension = defineExtension({
  name: "Editor",
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
});

export function Editor({
  editorState,
  editorSerializedState,
  isEditable = true,
  slug,
  onChange,
  onSerializedChange,
  setContent,
}: {
  slug?: string;
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  isEditable?: boolean;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  setContent?: (editorState: string) => void;
}) {
  const extension = useMemo(
    () => ({
      ...appExtension,
      editable: isEditable,
      $initialEditorState: editorSerializedState
        ? JSON.stringify(editorSerializedState)
        : editorState,
    }),
    [editorState, editorSerializedState, isEditable]
  );

  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalExtensionComposer
        contentEditable={null}
        extension={extension}>
        <TooltipProvider>
          {!isEditable && slug && <ReadOnlyToolbar slug={slug} />}
          <Plugins isReadOnly={!isEditable} />

          <Field>
            <OnChangePlugin
              ignoreSelectionChange={true}
              onChange={(editorState) => {
                onChange?.(editorState);
                const editorStateJSON = editorState.toJSON();

                onSerializedChange?.(editorStateJSON);
                setContent?.(JSON.stringify(editorStateJSON));
              }}
            />
          </Field>
        </TooltipProvider>
      </LexicalExtensionComposer>
    </div>
  );
}
