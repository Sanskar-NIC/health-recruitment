import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const nav = cn(
    buttonVariants({ variant: "outline" }),
    "size-8 bg-transparent p-0 opacity-70 hover:opacity-100"
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center px-10",
        caption_label: "text-sm font-medium",
        dropdowns: "relative flex items-center justify-center gap-2 text-sm font-medium",
        dropdown_root: "relative inline-flex h-8 items-center rounded-md border px-2 has-focus:ring-[3px] has-focus:ring-ring/50 [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1",
        dropdown: "absolute inset-0 cursor-pointer opacity-0",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: nav,
        button_next: nav,
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-0.5 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        today: "[&>button]:bg-accent [&>button]:text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", className)} />
          ) : orientation === "right" ? (
            <ChevronRight className={cn("size-4", className)} />
          ) : (
            <ChevronDown className={cn("size-3.5 opacity-60", className)} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
