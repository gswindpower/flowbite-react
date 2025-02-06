'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var tailwindMerge = require('tailwind-merge');
var mergeDeep = require('../../../helpers/merge-deep.cjs');
var DatepickerContext = require('../DatepickerContext.cjs');
var helpers = require('../helpers.cjs');

const DatepickerViewsYears = ({ theme: customTheme = {} }) => {
  const { theme: rootTheme, selectedDate, minDate, maxDate, viewDate, setViewDate, setView } = DatepickerContext.useDatePickerContext();
  const theme = mergeDeep.mergeDeep(rootTheme.views.years, customTheme);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: theme.items.base, children: [...Array(12)].map((_year, index) => {
    const first = helpers.startOfYearPeriod(viewDate, 10);
    const year = first + index;
    const newDate = new Date(viewDate.getTime());
    newDate.setFullYear(year);
    const isSelected = selectedDate && helpers.isDateEqual(selectedDate, newDate);
    const isDisabled = !helpers.isDateInRange(newDate, minDate, maxDate);
    return /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        disabled: isDisabled,
        type: "button",
        className: tailwindMerge.twMerge(
          theme.items.item.base,
          isSelected && theme.items.item.selected,
          isDisabled && theme.items.item.disabled
        ),
        onClick: () => {
          if (isDisabled) return;
          setViewDate(newDate);
          setView(helpers.Views.Months);
        },
        children: year
      },
      index
    );
  }) });
};

exports.DatepickerViewsYears = DatepickerViewsYears;
//# sourceMappingURL=Years.cjs.map
