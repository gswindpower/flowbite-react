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
            showClearButton && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                className: twMerge(theme.popup.footer.button.base, theme.popup.footer.button.clear),
                onClick: () => {
                  changeSelectedDate(null, true);
                },
                children: [
                  /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "17", height: "17", viewBox: "0 0 17 17", fill: "none", children: [
                    /* @__PURE__ */ jsx("g", { "clip-path": "url(#clip0_1366_2754)", children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        d: "M12.453 6.31675L10.593 8.17675C10.3797 8.39008 10.5264 8.75008 10.8264 8.75008H12.0197C12.0197 10.9567 10.2264 12.7501 8.01971 12.7501C7.49305 12.7501 6.97971 12.6501 6.51971 12.4567C6.27971 12.3567 6.00638 12.4301 5.82638 12.6101C5.48638 12.9501 5.60638 13.5234 6.05305 13.7034C6.65971 13.9501 7.32638 14.0834 8.01971 14.0834C10.9664 14.0834 13.353 11.6967 13.353 8.75008H14.5464C14.8464 8.75008 14.993 8.39008 14.7797 8.18341L12.9197 6.32341C12.793 6.19008 12.5797 6.19008 12.453 6.31675ZM4.01971 8.75008C4.01971 6.54341 5.81305 4.75008 8.01971 4.75008C8.54638 4.75008 9.05971 4.85008 9.51971 5.04341C9.75972 5.14341 10.033 5.07008 10.213 4.89008C10.553 4.55008 10.433 3.97675 9.98638 3.79675C9.37971 3.55008 8.71305 3.41675 8.01971 3.41675C5.07305 3.41675 2.68638 5.80341 2.68638 8.75008H1.49305C1.19305 8.75008 1.04638 9.11008 1.25971 9.31675L3.11971 11.1767C3.25305 11.3101 3.45971 11.3101 3.59305 11.1767L5.45305 9.31675C5.65971 9.11008 5.51305 8.75008 5.21305 8.75008H4.01971Z",
                        fill: "white"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_1366_2754", children: /* @__PURE__ */ jsx("rect", { width: "16", height: "16", fill: "white", transform: "translate(0.0197754 0.75)" }) }) })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "ml-[8px]", children: labelClearButton })
                ]
              }
            ),
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
