"use client";

import * as React from "react";

import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerNaturalLanguageProps {
  label?: string;
  value?: Date;
  disabledDates?: Matcher;
  onChange?: (date: Date | undefined) => void;
}

export function formatDateTime(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function DatePickerNaturalLanguage({
  label = "Schedule Date & Time",
  value: valueProp,
  disabledDates,
  onChange,
}: DatePickerNaturalLanguageProps) {
  const [open, setOpen] = React.useState(false);
  const [textValue, setTextValue] = React.useState(valueProp ? formatDateTime(valueProp) : "");
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTextValue(val);
    const parsed = parseDate(val);
    if (parsed) {
      setDate(parsed);
      onChange?.(parsed);
    }
  }

  function handleCalendarSelect(day: Date | undefined) {
    if (!day) return;
    const next = date ? new Date(date) : new Date();
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    setDate(next);
    setTextValue(formatDateTime(next));
    onChange?.(next);
  }

  return (
    <Field className="mx-auto max-w-xs">
      {label && <FieldLabel htmlFor="datetime-natural">{label}</FieldLabel>}
      <InputGroup>
        <InputGroupInput
          id="datetime-natural"
          value={textValue}
          placeholder="e.g. in 2 hours, tomorrow at 5pm"
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover
            open={open}
            onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                id="date-picker-trigger"
                variant="ghost"
                size="icon-xs"
                aria-label="Select date and time">
                <CalendarIcon />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              sideOffset={8}>
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                disabled={disabledDates}
                defaultMonth={date}
                onSelect={(day) => {
                  handleCalendarSelect(day);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      <div className="text-muted-foreground px-1 pt-1 text-xs">
        {date ? (
          <span className="text-foreground font-medium">Selected date: {formatDateTime(date)}</span>
        ) : (
          <span>Type a time or duration to calculate date and time</span>
        )}
      </div>
    </Field>
  );
}
