"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { SerializedEditorState } from "lexical";
import { FileXIcon, NotebookIcon } from "lucide-react";

import { cn, pluralize } from "@/lib/utils";
import { BoxWithFiles } from "@/types";

import AlertCountdown from "@/components/alert-countdown";
import BoxUploadsList from "@/components/box-uploads-list";
import DeleteBoxButton from "@/components/delete-box-button";
import DownloadAllButton from "@/components/download-all-button";
import ShareButton from "@/components/share-button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import UnlockBoxForm from "@/components/unlock-box-form";

const Editor = dynamic(
  () => import("@/components/editor/blocks/editor").then((mod) => mod.Editor),
  { ssr: false }
);

interface WrapperProps {
  box: BoxWithFiles;
  currentTime: number;
}

export default function Wrapper({ box, currentTime }: WrapperProps) {
  const [isProtected, setIsProtected] = useState(box.isProtected);

  const timeLeftMs = box.expiresAt.getTime() - currentTime;

  const hasNote = !!box?.content;

  const editorJson = box.content ? (JSON.parse(box.content) as SerializedEditorState) : undefined;

  const boxFilesLength = box?.files?.length ?? 0;
  const filesString = `${boxFilesLength} ${pluralize("file", boxFilesLength)} attached`;

  return (
    <>
      {isProtected ? (
        <UnlockBoxForm
          boxId={box.id}
          setIsProtected={setIsProtected}
        />
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-8",
            hasNote ? "md:grid-cols-[3fr_1.25fr]" : "md:grid-cols-[1.5fr_1fr]"
          )}>
          <section>
            <AlertCountdown
              boxId={box.id}
              timeLeftMs={timeLeftMs}
            />

            {hasNote ? (
              <Editor
                slug={box.slug}
                editorSerializedState={editorJson}
                isEditable={false}
              />
            ) : (
              <Empty className="rounded-lg border shadow">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <NotebookIcon />
                  </EmptyMedia>
                  <EmptyTitle>No note</EmptyTitle>
                  <EmptyDescription>This pastebox does not contain a note.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </section>

          <section>
            {box?.files && boxFilesLength > 0 ? (
              <div className="mb-4">
                {boxFilesLength > 1 && <DownloadAllButton id={box.id} />}
                <div className="text-muted-foreground mb-2 text-sm">{filesString}</div>
                <BoxUploadsList files={box.files} />
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileXIcon />
                  </EmptyMedia>
                  <EmptyTitle>No files</EmptyTitle>
                  <EmptyDescription>
                    This pastebox does not have any attached files.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            <div className="space-y-4">
              <ShareButton url={`${process.env.NEXT_PUBLIC_APP_URL}/${box.slug}`} />
              <DeleteBoxButton boxId={box.id} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
