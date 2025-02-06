import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { twMerge } from "tailwind-merge";
import { mergeDeep } from "../../../helpers/merge-deep.mjs";
import { useDatePickerContext } from "../DatepickerContext.mjs";
import {
  addDays,
  getFirstDayOfTheMonth,
  getFormattedDate,
  getWeekDays,
  isDateEqual,
  isDateInRange,
} from "../helpers.mjs";

const DatepickerViewsDays = ({ theme: customTheme = {} }) => {
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
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("div", {
        className: theme.header.base,
        children: weekDays.map((day, index) =>
          /* @__PURE__ */ jsx("span", { className: theme.header.title, children: day }, index),
        ),
      }),
      /* @__PURE__ */ jsx("div", {
        className: theme.items.base,
        children: [...Array(42)].reduce(
          (p, _date, index) => {
            const currentDate = addDays(startDate, index);
            const day = getFormattedDate(language, currentDate, { day: "numeric" });
            if (Number(day) === 1) p.count--;
            const isSelected = selectedDate && isDateEqual(selectedDate, currentDate);
            const isDisabled = !isDateInRange(currentDate, minDate, maxDate);
            const isRest = p.count === 1 ? "" : "text-[#CCD3D9]";
            p.buttons.push(
              /* @__PURE__ */ jsx(
                "button",
                {
                  disabled: isDisabled,
                  type: "button",
                  className: twMerge(
                    theme.items.item.base,
                    isSelected && theme.items.item.selected,
                    isDisabled && theme.items.item.disabled,
                    isRest,
                  ),
                  onClick: () => {
                    if (isDisabled) return;
                    changeSelectedDate(currentDate, true);
                  },
                  children: day,
                },
                index,
              ),
            );
            return p;
          },
          {
            count: 2,
            buttons: [],
          },
        ).buttons,
      }),
    ],
  });
};

export { DatepickerViewsDays };
//# sourceMappingURL=Days.mjs.map
