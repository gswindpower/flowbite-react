'use client';
import { jsx, jsxs } from 'react/jsx-runtime';
import { forwardRef, useMemo, useState, useRef, useImperativeHandle, useEffect } from 'react';
import { HiCalendar, HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { twMerge } from 'tailwind-merge';
import { mergeDeep } from '../../helpers/merge-deep.mjs';
import { getTheme } from '../../theme-store/index.mjs';
import { TextInput } from '../TextInput/TextInput.mjs';
import { DatepickerContext } from './DatepickerContext.mjs';
import { getFirstDateInRange, Views, isDateEqual, getFormattedDate, WeekStart, startOfYearPeriod, addYears, addMonths } from './helpers.mjs';
import { DatepickerViewsDays } from './Views/Days.mjs';
import { DatepickerViewsDecades } from './Views/Decades.mjs';
import { DatepickerViewsMonth } from './Views/Months.mjs';
import { DatepickerViewsYears } from './Views/Years.mjs';

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
  weekStart = WeekStart.Sunday,
  className,
  theme: customTheme = {},
  onChange,
  label,
  value,
  ...props
}, ref) => {
  const theme = mergeDeep(getTheme().datepicker, customTheme);
  const initialDate = defaultValue ? getFirstDateInRange(defaultValue, minDate, maxDate) : null;
  const effectiveDefaultView = useMemo(() => {
    return defaultValue ? getFirstDateInRange(defaultValue, minDate, maxDate) : /* @__PURE__ */ new Date();
  }, []);
  const [isOpen, setIsOpen] = useState(open);
  const [view, setView] = useState(Views.Days);
  const [selectedDate, setSelectedDate] = useState(value ?? initialDate);
  const [viewDate, setViewDate] = useState(value ?? effectiveDefaultView);
  const inputRef = useRef(null);
  const datepickerRef = useRef(null);
  const changeSelectedDate = (date, useAutohide) => {
    setSelectedDate(date);
    if ((date === null || date) && onChange) {
      onChange(date);
    }
    if (autoHide && view === Views.Days && useAutohide == true && !inline) {
      setIsOpen(false);
    }
  };
  const clearDate = () => {
    changeSelectedDate(initialDate, true);
    if (defaultValue) {
      setViewDate(defaultValue);
    }
  };
  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    clear() {
      clearDate();
    }
  }));
  const renderView = (type) => {
    switch (type) {
      case Views.Decades:
        return /* @__PURE__ */ jsx(DatepickerViewsDecades, { theme: theme.views.decades });
      case Views.Years:
        return /* @__PURE__ */ jsx(DatepickerViewsYears, { theme: theme.views.years });
      case Views.Months:
        return /* @__PURE__ */ jsx(DatepickerViewsMonth, { theme: theme.views.months });
      case Views.Days:
      default:
        return /* @__PURE__ */ jsx(DatepickerViewsDays, { theme: theme.views.days });
    }
  };
  const getNextView = () => {
    switch (view) {
      case Views.Days:
        return Views.Months;
      case Views.Months:
        return Views.Years;
      case Views.Years:
        return Views.Decades;
    }
    return view;
  };
  const getViewTitle = () => {
    switch (view) {
      case Views.Decades:
        return `${startOfYearPeriod(viewDate, 100) - 10} - ${startOfYearPeriod(viewDate, 100) + 100}`;
      case Views.Years:
        return `${startOfYearPeriod(viewDate, 10)} - ${startOfYearPeriod(viewDate, 10) + 11}`;
      case Views.Months:
        return getFormattedDate(language, viewDate, { year: "numeric" });
      case Views.Days:
      default:
        return getFormattedDate(language, viewDate, { month: "long", year: "numeric" });
    }
  };
  const getViewDatePage = (view2, date, value2) => {
    switch (view2) {
      case Views.Days:
        return new Date(addMonths(date, value2));
      case Views.Months:
        return new Date(addYears(date, value2));
      case Views.Years:
        return new Date(addYears(date, value2 * 10));
      case Views.Decades:
        return new Date(addYears(date, value2 * 100));
      default:
        return new Date(addYears(date, value2 * 10));
    }
  };
  useEffect(() => {
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
  useEffect(() => {
    const effectiveValue = value && getFirstDateInRange(new Date(value), minDate, maxDate);
    const effectiveSelectedDate = selectedDate && getFirstDateInRange(new Date(selectedDate), minDate, maxDate);
    if (effectiveSelectedDate && effectiveValue && !isDateEqual(effectiveValue, effectiveSelectedDate)) {
      setSelectedDate(effectiveValue);
    }
    if (selectedDate == null) {
      setSelectedDate(initialDate);
    }
  }, [value, setSelectedDate, setViewDate, selectedDate]);
  const displayValue = value === null ? label : getFormattedDate(language, selectedDate || /* @__PURE__ */ new Date());
  return /* @__PURE__ */ jsx(
    DatepickerContext.Provider,
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
      children: /* @__PURE__ */ jsxs("div", { className: twMerge(theme.root.base, className), children: [
        !inline && /* @__PURE__ */ jsx(
          TextInput,
          {
            theme: theme.root.input,
            icon: HiCalendar,
            ref: inputRef,
            onFocus: () => {
              if (selectedDate && !isDateEqual(viewDate, selectedDate)) {
                setViewDate(selectedDate);
              }
              setIsOpen(true);
            },
            value: displayValue,
            readOnly: true,
            defaultValue: initialDate ? getFormattedDate(language, initialDate) : label,
            ...props
          }
        ),
        (isOpen || inline) && /* @__PURE__ */ jsx("div", { ref: datepickerRef, className: twMerge(theme.popup.root.base, inline && theme.popup.root.inline), children: /* @__PURE__ */ jsxs("div", { className: theme.popup.root.inner, children: [
          /* @__PURE__ */ jsxs("div", { className: theme.popup.header.base, children: [
            title && /* @__PURE__ */ jsx("div", { className: theme.popup.header.title, children: title }),
            /* @__PURE__ */ jsxs("div", { className: theme.popup.header.selectors.base, children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: twMerge(
                    theme.popup.header.selectors.button.base,
                    theme.popup.header.selectors.button.prev
                  ),
                  onClick: () => setViewDate(getViewDatePage(view, viewDate, -1)),
                  children: /* @__PURE__ */ jsx(HiArrowLeft, {})
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: twMerge(
                    theme.popup.header.selectors.button.base,
                    theme.popup.header.selectors.button.view
                  ),
                  onClick: () => setView(getNextView()),
                  children: getViewTitle()
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: twMerge(
                    theme.popup.header.selectors.button.base,
                    theme.popup.header.selectors.button.next
                  ),
                  onClick: () => setViewDate(getViewDatePage(view, viewDate, 1)),
                  children: /* @__PURE__ */ jsx(HiArrowRight, {})
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: theme.popup.view.base, children: renderView(view) }),
          (showClearButton || showTodayButton) && /* @__PURE__ */ jsxs("div", { className: theme.popup.footer.base, children: [
            showTodayButton && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: twMerge(theme.popup.footer.button.base, theme.popup.footer.button.today),
                onClick: () => {
                  const today = /* @__PURE__ */ new Date();
                  changeSelectedDate(today, true);
                  setViewDate(today);
                },
                children: labelTodayButton
              }
            ),
            showClearButton && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: twMerge(theme.popup.footer.button.base, theme.popup.footer.button.clear),
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
const Datepicker = forwardRef(DatepickerRender);
Datepicker.displayName = "Datepicker";

export { Datepicker };
//# sourceMappingURL=Datepicker.mjs.map
