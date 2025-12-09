"use client";

import { $isCodeNode } from "@lexical/code";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $setSelection,
  type LexicalEditor,
} from "lexical";
import { CircleCheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { useCopy } from "@/hooks/use-copy";
import { castError } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface Props {
  editor: LexicalEditor;
  getCodeDOMNode: () => HTMLElement | null;
}

export function CopyButton({ editor, getCodeDOMNode }: Props) {
  const { copy, isCopySuccess } = useCopy();

  async function handleClick(): Promise<void> {
    const codeDOMNode = getCodeDOMNode();

    if (!codeDOMNode) {
      return;
    }

    let content = "";

    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }

      const selection = $getSelection();
      $setSelection(selection);
    });

    try {
      await copy(content);
    } catch (error) {
      castError(error);
      toast.error("Copying failed.");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="cursor-pointer"
      onClick={handleClick}
      aria-label="copy to clipboard">
      {isCopySuccess ? (
        <CircleCheckIcon className="size-4 stroke-green-500" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Button>
  );
}
