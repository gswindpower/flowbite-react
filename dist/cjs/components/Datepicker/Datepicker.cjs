'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var hi = require('react-icons/hi');
var tailwindMerge = require('tailwind-merge');
var mergeDeep = require('../../helpers/merge-deep.cjs');
var index = require('../../theme-store/index.cjs');
var TextInput = require('../TextInput/TextInput.cjs');
var DatepickerContext = require('./DatepickerContext.cjs');
var helpers = require('./helpers.cjs');
var Days = require('./Views/Days.cjs');
var Decades = require('./Views/Decades.cjs');
var Months = require('./Views/Months.cjs');
var Years = require('./Views/Years.cjs');

const DatepickerRender = ({
  title,
  open,
  inline = false,
  autoHide = true,
  // Hide when selected the day
  showClearButton = true,
  labelClearButton = "Clear",
  showTodayButton = true,
  labelTodayButton = "Today",
  defaultValue,
  minDate,
  maxDate,
  language = "en",
  weekStart = helpers.WeekStart.Sunday,
  className,
  theme: customTheme = {},
  onChange,
  label,
  value,
  ...props
}, ref) => {
  const theme = mergeDeep.mergeDeep(index.getTheme().datepicker, customTheme);
  const initialDate = defaultValue ? helpers.getFirstDateInRange(defaultValue, minDate, maxDate) : null;
  const effectiveDefaultView = React.useMemo(() => {
    return defaultValue ? helpers.getFirstDateInRange(defaultValue, minDate, maxDate) : /* @__PURE__ */ new Date();
  }, []);
  const [isOpen, setIsOpen] = React.useState(open);
  const [view, setView] = React.useState(helpers.Views.Days);
  const [selectedDate, setSelectedDate] = React.useState(value ?? initialDate);
  const [viewDate, setViewDate] = React.useState(value ?? effectiveDefaultView);
  const inputRef = React.useRef(null);
  const datepickerRef = React.useRef(null);
  const changeSelectedDate = (date, useAutohide) => {
    setSelectedDate(date);
    if ((date === null || date) && onChange) {
      onChange(date);
    }
    if (autoHide && view === helpers.Views.Days && useAutohide == true && !inline) {
      setIsOpen(false);
    }
  };
  const clearDate = () => {
    changeSelectedDate(initialDate, true);
    if (defaultValue) {
      setViewDate(defaultValue);
    }
  };
  React.useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    clear() {
      clearDate();
    }
  }));
  const renderView = (type) => {
    switch (type) {
      case helpers.Views.Decades:
        return /* @__PURE__ */ jsxRuntime.jsx(Decades.DatepickerViewsDecades, { theme: theme.views.decades });
      case helpers.Views.Years:
        return /* @__PURE__ */ jsxRuntime.jsx(Years.DatepickerViewsYears, { theme: theme.views.years });
      case helpers.Views.Months:
        return /* @__PURE__ */ jsxRuntime.jsx(Months.DatepickerViewsMonth, { theme: theme.views.months });
      case helpers.Views.Days:
      default:
        return /* @__PURE__ */ jsxRuntime.jsx(Days.DatepickerViewsDays, { theme: theme.views.days });
    }
  };
  const getNextView = () => {
    switch (view) {
      case helpers.Views.Days:
        return helpers.Views.Months;
      case helpers.Views.Months:
        return helpers.Views.Years;
      case helpers.Views.Years:
        return helpers.Views.Decades;
    }
    return view;
  };
  const getViewTitle = () => {
    switch (view) {
      case helpers.Views.Decades:
        return `${helpers.startOfYearPeriod(viewDate, 100) - 10} - ${helpers.startOfYearPeriod(viewDate, 100) + 100}`;
      case helpers.Views.Years:
        return `${helpers.startOfYearPeriod(viewDate, 10)} - ${helpers.startOfYearPeriod(viewDate, 10) + 11}`;
      case helpers.Views.Months:
        return helpers.getFormattedDate(language, viewDate, { year: "numeric" });
      case helpers.Views.Days:
      default:
        return helpers.getFormattedDate(language, viewDate, { month: "long", year: "numeric" });
    }
  };
  const getViewDatePage = (view2, date, value2) => {
    switch (view2) {
      case helpers.Views.Days:
        return new Date(helpers.addMonths(date, value2));
      case helpers.Views.Months:
        return new Date(helpers.addYears(date, value2));
      case helpers.Views.Years:
        return new Date(helpers.addYears(date, value2 * 10));
      case helpers.Views.Decades:
        return new Date(helpers.addYears(date, value2 * 100));
      default:
        return new Date(helpers.addYears(date, value2 * 10));
    }
  };
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideDatepicker = datepickerRef?.current?.contains(event.target);
      const clickedInsideInput = inputRef?.current?.contains(event.target);
      if (!clickedInsideDatepicker && !clickedInsideInput) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef, datepickerRef, setIsOpen]);
  React.useEffect(() => {
    const effectiveValue = value && helpers.getFirstDateInRange(new Date(value), minDate, maxDate);
    const effectiveSelectedDate = selectedDate && helpers.getFirstDateInRange(new Date(selectedDate), minDate, maxDate);
    if (effectiveSelectedDate && effectiveValue && !helpers.isDateEqual(effectiveValue, effectiveSelectedDate)) {
      setSelectedDate(effectiveValue);
    }
    if (selectedDate == null) {
      setSelectedDate(initialDate);
    }
  }, [value, setSelectedDate, setViewDate, selectedDate]);
  const displayValue = value === null ? label : helpers.getFormattedDate(language, selectedDate || /* @__PURE__ */ new Date());
  return /* @__PURE__ */ jsxRuntime.jsx(
    DatepickerContext.DatepickerContext.Provider,
    {
      value: {
        theme,
        language,
        minDate,
        maxDate,
        weekStart,
        isOpen,
        setIsOpen,
        view,
        setView,
        viewDate,
        setViewDate,
        selectedDate,
        setSelectedDate,
        changeSelectedDate
      },
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: tailwindMerge.twMerge(theme.root.base, className), children: [
        !inline && /* @__PURE__ */ jsxRuntime.jsx(
          TextInput.TextInput,
          {
            theme: theme.root.input,
            icon: hi.HiCalendar,
            ref: inputRef,
            onFocus: () => {
              if (selectedDate && !helpers.isDateEqual(viewDate, selectedDate)) {
                setViewDate(selectedDate);
              }
              setIsOpen(true);
            },
            value: displayValue,
            readOnly: true,
            defaultValue: initialDate ? helpers.getFormattedDate(language, initialDate) : label,
            ...props
          }
        ),
        (isOpen || inline) && /* @__PURE__ */ jsxRuntime.jsx("div", { ref: datepickerRef, className: tailwindMerge.twMerge(theme.popup.root.base, inline && theme.popup.root.inline), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: theme.popup.root.inner, children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: theme.popup.header.base, children: [
            title && /* @__PURE__ */ jsxRuntime.jsx("div", { className: theme.popup.header.title, children: title }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: theme.popup.header.selectors.base, children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  type: "button",
                  className: tailwindMerge.twMerge(
                    theme.popup.header.selectors.button.base,
                    theme.popup.header.selectors.button.prev
                  ),
                  onClick: () => setViewDate(getViewDatePage(view, viewDate, -1)),
                  children: /* @__PURE__ */ jsxRuntime.jsx(hi.HiArrowLeft, {})
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  type: "button",
                  className: tailwindMerge.twMerge(
                    theme.popup.header.selectors.button.base,
                    theme.popup.header.selectors.button.view
                  ),
                  onClick: () => setView(getNextView()),
                  children: getViewTitle()
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  type: "button",
                  className: tailwindMerge.twMerge(
                    theme.popup.header.selectors.button.base,
                    theme.popup.header.selectors.button.next
                  ),
                  onClick: () => setViewDate(getViewDatePage(view, viewDate, 1)),
                  children: /* @__PURE__ */ jsxRuntime.jsx(hi.HiArrowRight, {})
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: theme.popup.view.base, children: renderView(view) }),
          (showClearButton || showTodayButton) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: theme.popup.footer.base, children: [
            showTodayButton && /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: tailwindMerge.twMerge(theme.popup.footer.button.base, theme.popup.footer.button.today),
                onClick: () => {
                  const today = /* @__PURE__ */ new Date();
                  changeSelectedDate(today, true);
                  setViewDate(today);
                },
                children: labelTodayButton
              }
            ),
            showClearButton && /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: tailwindMerge.twMerge(theme.popup.footer.button.base, theme.popup.footer.button.clear),
                onClick: () => {
                  changeSelectedDate(null, true);
                },
                children: labelClearButton
              }
            )
          ] })
        ] }) })
      ] })
    }
  );
};
const Datepicker = React.forwardRef(DatepickerRender);
Datepicker.displayName = "Datepicker";

exports.Datepicker = Datepicker;
//# sourceMappingURL=Datepicker.cjs.map
