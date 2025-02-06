'use client';
import { jsx } from 'react/jsx-runtime';
import { twMerge } from 'tailwind-merge';
import { mergeDeep } from '../../../helpers/merge-deep.mjs';
import { useDatePickerContext } from '../DatepickerContext.mjs';
import { startOfYearPeriod, isDateEqual, isDateInRange, Views } from '../helpers.mjs';

const DatepickerViewsYears = ({ theme: customTheme = {} }) => {
  const { theme: rootTheme, selectedDate, minDate, maxDate, viewDate, setViewDate, setView } = useDatePickerContext();
  const theme = mergeDeep(rootTheme.views.years, customTheme);
  return /* @__PURE__ */ jsx("div", { className: theme.items.base, children: [...Array(12)].map((_year, index) => {
    const first = startOfYearPeriod(viewDate, 10);
    const year = first + index;
    const newDate = new Date(viewDate.getTime());
    newDate.setFullYear(year);
    const isSelected = selectedDate && isDateEqual(selectedDate, newDate);
    const isDisabled = !isDateInRange(newDate, minDate, maxDate);
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
          setViewDate(newDate);
          setView(Views.Months);
        },
        children: year
      },
      index
    );
  }) });
};

export { DatepickerViewsYears };
//# sourceMappingURL=Years.mjs.map
