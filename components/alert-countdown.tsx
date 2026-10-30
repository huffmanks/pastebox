"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import { ClockAlertIcon, ClockPlusIcon, InfoIcon } from "lucide-react";
import { toast } from "sonner";

import { deleteBox, updateBoxExpiresAt } from "@/actions/box";
import { useCountdown } from "@/hooks/use-countdown";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DatePickerNaturalLanguage,
  formatDateTime,
} from "@/components/ui/date-picker-natural-language";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AlertCountdown({
  boxId,
  timeLeftMs,
}: {
  boxId: string;
  timeLeftMs: number;
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [count, prettyCount, { resetCountdown, startCountdown, stopCountdown }] = useCountdown({
    countStart: timeLeftMs,
    intervalMs: 1000 * 60,
  });

  async function handleConfirmExtension() {
    if (!selectedDate) return;

    const diffMs = selectedDate.getTime() - Date.now();
    if (diffMs <= 0) {
      toast.error("Please select a future date and time.");
      return;
    }

    await updateBoxExpiresAt(boxId, diffMs);
    resetCountdown(diffMs);
    setOpen(false);
    toast("Expiration updated", {
      description: `Extended until ${formatDateTime(selectedDate)}.`,
    });
  }

  useEffect(() => {
    if (count === 0) {
      deleteBox(boxId);
      redirect("/");
    }
  }, [boxId, count]);

  useEffect(() => {
    startCountdown();

    return () => {
      stopCountdown();
    };
  }, [startCountdown, stopCountdown]);

  return (
    <Alert className="mb-8">
      <ClockAlertIcon className="stroke-red-500" />

      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <HoverCard>
            <div>
              <HoverCardTrigger asChild>
                <div className="mb-0.5 flex items-center gap-1">
                  <p className="text-sm font-medium">Time remaining</p>
                  <InfoIcon className="size-3" />
                </div>
              </HoverCardTrigger>
              <p className="text-muted-foreground text-xs">{prettyCount}</p>
            </div>
            <HoverCardContent>
              <p className="text-sm">
                Your box will be deleted when time expires. Extend to reset the time to 24 hours.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="flex items-center">
          <Popover
            open={open}
            onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button className="size-9 cursor-pointer rounded-full sm:h-8 sm:w-auto sm:rounded-md">
                <ClockPlusIcon />
                <span className="hidden sm:inline-flex">Extend</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-4">
              <div className="space-y-4">
                <DatePickerNaturalLanguage
                  label="Extend Duration"
                  value={selectedDate}
                  disabledDates={{ before: new Date() }}
                  onChange={setSelectedDate}
                />
                <Button
                  type="button"
                  className="w-full"
                  size="sm"
                  disabled={!selectedDate}
                  onClick={handleConfirmExtension}>
                  Confirm
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Alert>
  );
}
