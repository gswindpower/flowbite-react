'use strict';

var jsxRuntime = require('react/jsx-runtime');
var tailwindMerge = require('tailwind-merge');
var mergeDeep = require('../../../helpers/merge-deep.cjs');
var DatepickerContext = require('../DatepickerContext.cjs');
var helpers = require('../helpers.cjs');

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
  } = DatepickerContext.useDatePickerContext();
  const theme = mergeDeep.mergeDeep(rootTheme.views.days, customTheme);
  const weekDays = helpers.getWeekDays(language, weekStart);
  const startDate = helpers.getFirstDayOfTheMonth(viewDate, weekStart);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: theme.header.base, children: weekDays.map((day, index) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: theme.header.title, children: day }, index)) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: theme.items.base, children: [...Array(42)].reduce(
      (p, _date, index) => {
        const currentDate = helpers.addDays(startDate, index);
        const day = helpers.getFormattedDate(language, currentDate, { day: "numeric" });
        if (Number(day) === 1) p.count--;
        const isSelected = selectedDate && helpers.isDateEqual(selectedDate, currentDate);
        const isDisabled = !helpers.isDateInRange(currentDate, minDate, maxDate);
        const isRest = p.count === 1 ? "" : "dark:text-datepicker-dark text-datepicker";
        p.buttons.push(
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              disabled: isDisabled,
              type: "button",
              className: tailwindMerge.twMerge(
                theme.items.item.base,
                isSelected && theme.items.item.selected,
                isDisabled && theme.items.item.disabled,
                isRest
              ),
              onClick: () => {
                if (isDisabled) return;
                changeSelectedDate(currentDate, true);
              },
              children: day
            },
            index
          )
        );
        return p;
      },
      {
        count: 2,
        buttons: []
      }
    ).buttons })
  ] });
};

exports.DatepickerViewsDays = DatepickerViewsDays;
//# sourceMappingURL=Days.cjs.map
