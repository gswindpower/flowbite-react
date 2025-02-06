import { jsx } from 'react/jsx-runtime';
import { twMerge } from 'tailwind-merge';
import { mergeDeep } from '../../../helpers/merge-deep.mjs';
import { useDatePickerContext } from '../DatepickerContext.mjs';
import { startOfYearPeriod, addYears, isDateInDecade, isDateInRange, Views } from '../helpers.mjs';

const DatepickerViewsDecades = ({ theme: customTheme = {} }) => {
  const { theme: rootTheme, viewDate, selectedDate, minDate, maxDate, setViewDate, setView } = useDatePickerContext();
  const theme = mergeDeep(rootTheme.views.decades, customTheme);
  const first = startOfYearPeriod(viewDate, 100);
  return /* @__PURE__ */ jsx("div", { className: theme.items.base, children: [...Array(12)].map((_year, index) => {
    const year = first - 10 + index * 10;
    const newDate = new Date(viewDate.getTime());
    newDate.setFullYear(year + viewDate.getFullYear() % 10);
    const firstDate = new Date(year, 0, 1);
    const lastDate = addYears(firstDate, 9);
    const isSelected = selectedDate && isDateInDecade(selectedDate, year);
    const isDisabled = !isDateInRange(firstDate, minDate, maxDate) && !isDateInRange(lastDate, minDate, maxDate);
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
          selectedDate && setViewDate(addYears(viewDate, year - selectedDate.getFullYear()));
          setView(Views.Years);
        },
        children: year
      },
      index
    );
  }) });
};

export { DatepickerViewsDecades };
//# sourceMappingURL=Decades.mjs.map
