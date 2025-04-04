import type { FC } from "react";
import { twMerge } from "tailwind-merge";
import { mergeDeep } from "../../../helpers/merge-deep";
import type { DeepPartial } from "../../../types";
import { useDatePickerContext } from "../DatepickerContext";
import { addDays, getFirstDayOfTheMonth, getFormattedDate, getWeekDays, isDateEqual, isDateInRange } from "../helpers";

export interface FlowbiteDatepickerViewsDaysTheme {
  header: {
    base: string;
    title: string;
  };
  items: {
    base: string;
    item: {
      base: string;
      selected: string;
      disabled: string;
    };
  };
}

export interface DatepickerViewsDaysProps {
  theme?: DeepPartial<FlowbiteDatepickerViewsDaysTheme>;
}

export const DatepickerViewsDays: FC<DatepickerViewsDaysProps> = ({ theme: customTheme = {} }) => {
  const {
    theme: rootTheme,
    weekStart,
    minDate,
    maxDate,
    viewDate,
    selectedDate,
    changeSelectedDate,
    language,
  } = useDatePickerContext();

  const theme = mergeDeep(rootTheme.views.days, customTheme);
  const weekDays = getWeekDays(language, weekStart);
  const startDate = getFirstDayOfTheMonth(viewDate, weekStart);

  return (
    <>
      <div className={theme.header.base}>
        {weekDays.map((day, index) => (
          <span key={index} className={theme.header.title}>
            {day}
          </span>
        ))}
      </div>
      <div className={theme.items.base}>
        {
          [...Array(42)].reduce<{ count: number; buttons: Array<JSX.Element> }>(
            (p, _date, index) => {
              const currentDate = addDays(startDate, index);
              const day = getFormattedDate(language, currentDate, { day: "numeric" });
              if (Number(day) === 1) p.count--;

              const isSelected = selectedDate && isDateEqual(selectedDate, currentDate);
              const isDisabled = !isDateInRange(currentDate, minDate, maxDate);
              const isRest = p.count === 1 ? "" : "dark:text-datepicker-dark text-datepicker";

              p.buttons.push(
                <button
                  disabled={isDisabled}
                  key={index}
                  type="button"
                  className={twMerge(
                    theme.items.item.base,
                    isSelected && theme.items.item.selected,
                    isDisabled && theme.items.item.disabled,
                    isRest,
                  )}
                  onClick={() => {
                    if (isDisabled) return;

                    changeSelectedDate(currentDate, true);
                  }}
                >
                  {day}
                </button>,
              );

              return p;
            },
            {
              count: 2,
              buttons: [],
            },
          ).buttons
        }
      </div>
    </>
  );
};
