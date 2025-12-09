"use client";

import { useState } from "react";

import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { cn } from "@/lib/utils";

import { ActionsPlugin } from "@/components/editor/plugins/actions/actions-plugin";
import { ClearEditorActionPlugin } from "@/components/editor/plugins/actions/clear-editor-plugin";
import { CounterCharacterPlugin } from "@/components/editor/plugins/actions/counter-character-plugin";
import { SpeechToTextPlugin } from "@/components/editor/plugins/actions/speech-to-text-plugin";
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin";
import { CodeActionMenuPlugin } from "@/components/editor/plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin";
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin";
import { LinkPlugin } from "@/components/editor/plugins/link-plugin";
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list";
import { FormatCodeBlock } from "@/components/editor/plugins/toolbar/block-format/format-code-block";
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote";
import { CodeLanguageToolbarPlugin } from "@/components/editor/plugins/toolbar/code-language-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";
import { ContentEditable } from "@/components/editor/ui/content-editable";
import { Separator } from "@/components/ui/separator";

export function Plugins({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      {/* toolbar plugins */}
      {!isReadOnly && (
        <ToolbarPlugin>
          {({ blockType }) => (
            <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1">
              <BlockFormatDropDown>
                <FormatParagraph />
                <FormatHeading levels={["h1", "h2", "h3"]} />
                <FormatNumberedList />
                <FormatBulletedList />
                <FormatCheckList />
                <FormatCodeBlock />
                <FormatQuote />
              </BlockFormatDropDown>
              <Separator
                orientation="vertical"
                className="h-7!"
              />
              {blockType === "code" ? (
                <CodeLanguageToolbarPlugin />
              ) : (
                <>
                  <FontFormatToolbarPlugin />
                  <Separator
                    orientation="vertical"
                    className="h-7!"
                  />
                  <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
                </>
              )}
            </div>
          )}
        </ToolbarPlugin>
      )}

      {/* editor plugins */}

      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div>
              <div ref={onRef}>
                <ContentEditable placeholder={"Start typing ..."} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ClickableLinkPlugin />
        {!isReadOnly && (
          <>
            <ListPlugin />
            <CheckListPlugin />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
            <CodeHighlightPlugin />
            <MarkdownShortcutPlugin
              transformers={[
                CHECK_LIST,
                ...ELEMENT_TRANSFORMERS,
                ...MULTILINE_ELEMENT_TRANSFORMERS,
                ...TEXT_FORMAT_TRANSFORMERS,
                ...TEXT_MATCH_TRANSFORMERS,
              ]}
            />
            <AutoLinkPlugin />
            <LinkPlugin />
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </>
        )}
      </div>

      <ActionsPlugin>
        <div
          className={cn(
            "clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1",
            isReadOnly && "min-h-10"
          )}>
          {!isReadOnly && (
            <div className="flex flex-1 justify-start">
              {/* left side action buttons */}
              <SpeechToTextPlugin />
            </div>
          )}
          <div className="flex flex-1 justify-center">
            {/* center action buttons */}
            <CounterCharacterPlugin charset="UTF-16" />
          </div>
          {!isReadOnly && (
            <div className="flex flex-1 justify-end">
              {/* right side action buttons */}
              <>
                <ClearEditorActionPlugin />
                <ClearEditorPlugin />
              </>
            </div>
          )}
        </div>
      </ActionsPlugin>
    </div>
  );
}
