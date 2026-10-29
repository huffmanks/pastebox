"use client";

import { CloudDownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DownloadAllButton({ id }: { id: string }) {
  return (
    <Button
      asChild
      variant="secondary"
      className="mb-4 w-full cursor-pointer">
      <a href={`/api/box/${id}/download`}>
        <CloudDownloadIcon />
        <span>Download all</span>
      </a>
    </Button>
  );
}
