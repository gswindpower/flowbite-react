import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { twMerge } from 'tailwind-merge';
import { mergeDeep } from '../../../helpers/merge-deep.mjs';
import { useDatePickerContext } from '../DatepickerContext.mjs';
import { getWeekDays, getFirstDayOfTheMonth, addDays, getFormattedDate, isDateEqual, isDateInRange } from '../helpers.mjs';

const DatepickerViewsDays = ({ theme: customTheme = {} }) => {
  const {
    theme: rootTheme,
    weekStart,
    minDate,
    maxDate,
    viewDate,
    selectedDate,
    changeSelectedDate,
    language
  } = useDatePickerContext();
  const theme = mergeDeep(rootTheme.views.days, customTheme);
  const weekDays = getWeekDays(language, weekStart);
  const startDate = getFirstDayOfTheMonth(viewDate, weekStart);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: theme.header.base, children: weekDays.map((day, index) => /* @__PURE__ */ jsx("span", { className: theme.header.title, children: day }, index)) }),
    /* @__PURE__ */ jsx("div", { className: theme.items.base, children: [...Array(42)].map((_date, index) => {
      const currentDate = addDays(startDate, index);
      const day = getFormattedDate(language, currentDate, { day: "numeric" });
      const isSelected = selectedDate && isDateEqual(selectedDate, currentDate);
      const isDisabled = !isDateInRange(currentDate, minDate, maxDate);
      return /* @__PURE__ */ jsx(
        "button",
        {
          disabled: isDisabled,
          type: "button",
          className: twMerge(
            theme.items.item.base,
            isSelected && theme.items.item.selected,
            isDisabled && theme.items.item.disabled
          ),
          onClick: () => {
            if (isDisabled) return;
            changeSelectedDate(currentDate, true);
          },
          children: day
        },
        index
      );
    }) })
  ] });
};

export { DatepickerViewsDays };
//# sourceMappingURL=Days.mjs.map
