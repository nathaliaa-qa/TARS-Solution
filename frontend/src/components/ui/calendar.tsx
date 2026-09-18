"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DropdownProps } from "react-day-picker"

import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Substitui o <select> de mes/ano do react-day-picker por um totalmente nosso,
 * pra nao depender das classNames internas da lib (que mudam entre versoes).
 */
function CustomDropdown({ value, onChange, children, name }: DropdownProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={cn(
        "h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "cursor-pointer"
      )}
    >
      {children}
    </select>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 bg-background text-foreground border border-border rounded-md shadow-md w-fit",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        // Sem "relative" + botoes absolutos: tudo flui na mesma linha,
        // entao dropdown largo nunca fica embaixo da setinha.
        caption: "flex items-center justify-center gap-1.5 pt-1",
        // Com captionLayout="dropdown-buttons" o texto "janeiro 2000" ainda e
        // renderizado (pra acessibilidade) por baixo dos selects — vhidden esconde
        // visualmente, mantendo disponivel pra leitor de tela.
        caption_label: "sr-only",
        caption_dropdowns: "flex items-center gap-1.5",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 shrink-0"
        ),
        table: "border-collapse",
        head_row: "grid grid-cols-7 mb-1",
        head_cell:
          "text-muted-foreground font-normal text-[0.75rem] h-9 flex items-center justify-center",
        row: "grid grid-cols-7 mt-1",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
          "[&:has([aria-selected])]:bg-accent focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        day_today: "border border-primary text-foreground rounded-md",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Dropdown: CustomDropdown,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
