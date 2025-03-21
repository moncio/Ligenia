
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DayProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  tournamentDates?: {
    date: Date;
    name: string;
  }[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  tournamentDates = [],
  ...props
}: CalendarProps) {
  // Function to modify day appearance based on tournament dates
  const modifiersClassNames = {
    tournament: "border-2 border-blue-500 bg-blue-50 font-bold",
  };

  // Function to determine which days have tournaments
  const tournamentDays = React.useMemo(() => {
    const days = new Set<number>();
    
    tournamentDates.forEach(({ date }) => {
      // Store timestamp to compare dates
      days.add(date.getTime());
    });
    
    return {
      tournament: (date: Date) => days.has(date.getTime()),
    };
  }, [tournamentDates]);
  
  // Custom day renderer to show tournament tooltip
  const renderDay = (props: DayProps) => {
    const { date, displayMonth } = props;
    
    // If date is not defined, return default content
    if (!date) return <div className="h-9 w-9 p-0 font-normal" />;
    
    // Find tournaments for this day
    const tournamentsOnDay = tournamentDates.filter(
      ({ date: tournamentDate }) => 
        tournamentDate.getDate() === date.getDate() && 
        tournamentDate.getMonth() === date.getMonth() && 
        tournamentDate.getFullYear() === date.getFullYear()
    );
    
    if (tournamentsOnDay.length > 0) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="relative h-9 w-9 p-0 font-medium">
                {date.getDate()}
                {tournamentsOnDay.length > 1 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                    {tournamentsOnDay.length}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Torneos:</p>
                <ul className="list-disc pl-4 text-sm">
                  {tournamentsOnDay.map((tournament, index) => (
                    <li key={index}>{tournament.name}</li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return <div className="h-9 w-9 p-0 font-normal">{date.getDate()}</div>;
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      modifiersClassNames={modifiersClassNames}
      modifiers={tournamentDays}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Day: renderDay
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
