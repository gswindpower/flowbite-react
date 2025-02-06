import { jsx } from 'react/jsx-runtime';
import { twMerge } from 'tailwind-merge';
import { mergeDeep } from '../../../helpers/merge-deep.mjs';
import { useDatePickerContext } from '../DatepickerContext.mjs';
import { getFormattedDate, isDateEqual, isDateInRange, Views } from '../helpers.mjs';

const DatepickerViewsMonth = ({ theme: customTheme = {} }) => {
  const {
    theme: rootTheme,
    minDate,
    maxDate,
    selectedDate,
    viewDate,
    language,
    setViewDate,
    setView
  } = useDatePickerContext();
  const theme = mergeDeep(rootTheme.views.months, customTheme);
  return /* @__PURE__ */ jsx("div", { className: theme.items.base, children: [...Array(12)].map((_month, index) => {
    const newDate = /* @__PURE__ */ new Date();
    newDate.setMonth(index, 1);
    newDate.setFullYear(viewDate.getFullYear());
    const month = getFormattedDate(language, newDate, { month: "short" });
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
          setView(Views.Days);
        },
        children: month
      },
      index
    );
  }) });
};

export { DatepickerViewsMonth };
//# sourceMappingURL=Months.mjs.map
