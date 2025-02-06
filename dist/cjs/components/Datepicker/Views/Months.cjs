'use strict';

var jsxRuntime = require('react/jsx-runtime');
var tailwindMerge = require('tailwind-merge');
var mergeDeep = require('../../../helpers/merge-deep.cjs');
var DatepickerContext = require('../DatepickerContext.cjs');
var helpers = require('../helpers.cjs');

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
  } = DatepickerContext.useDatePickerContext();
  const theme = mergeDeep.mergeDeep(rootTheme.views.months, customTheme);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: theme.items.base, children: [...Array(12)].map((_month, index) => {
    const newDate = /* @__PURE__ */ new Date();
    newDate.setMonth(index, 1);
    newDate.setFullYear(viewDate.getFullYear());
    const month = helpers.getFormattedDate(language, newDate, { month: "short" });
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
          setView(helpers.Views.Days);
        },
        children: month
      },
      index
    );
  }) });
};

exports.DatepickerViewsMonth = DatepickerViewsMonth;
//# sourceMappingURL=Months.cjs.map
