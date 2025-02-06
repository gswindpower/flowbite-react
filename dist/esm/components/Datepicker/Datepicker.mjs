"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { HiArrowLeft, HiArrowRight, HiCalendar } from "react-icons/hi";
import { jsx, jsxs } from "react/jsx-runtime";
import { twMerge } from "tailwind-merge";
import { mergeDeep } from "../../helpers/merge-deep.mjs";
import { getTheme } from "../../theme-store/index.mjs";
import { TextInput } from "../TextInput/TextInput.mjs";
import { DatepickerContext } from "./DatepickerContext.mjs";
import {
  addMonths,
  addYears,
  getFirstDateInRange,
  getFormattedDate,
  isDateEqual,
  startOfYearPeriod,
  Views,
  WeekStart,
} from "./helpers.mjs";
import { DatepickerViewsDays } from "./Views/Days.mjs";
import { DatepickerViewsDecades } from "./Views/Decades.mjs";
import { DatepickerViewsMonth } from "./Views/Months.mjs";
import { DatepickerViewsYears } from "./Views/Years.mjs";

const DatepickerRender = (
  {
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
  },
  ref,
) => {
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
    },
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
  return /* @__PURE__ */ jsx(DatepickerContext.Provider, {
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
      changeSelectedDate,
    },
    children: /* @__PURE__ */ jsxs("div", {
      className: twMerge(theme.root.base, className),
      children: [
        !inline &&
          /* @__PURE__ */ jsx(TextInput, {
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
            ...props,
          }),
        (isOpen || inline) &&
          /* @__PURE__ */ jsx("div", {
            ref: datepickerRef,
            className: twMerge(theme.popup.root.base, inline && theme.popup.root.inline),
            children: /* @__PURE__ */ jsxs("div", {
              className: theme.popup.root.inner,
              children: [
                /* @__PURE__ */ jsxs("div", {
                  className: theme.popup.header.base,
                  children: [
                    title && /* @__PURE__ */ jsx("div", { className: theme.popup.header.title, children: title }),
                    /* @__PURE__ */ jsxs("div", {
                      className: theme.popup.header.selectors.base,
                      children: [
                        /* @__PURE__ */ jsx("button", {
                          type: "button",
                          className: twMerge(
                            theme.popup.header.selectors.button.base,
                            theme.popup.header.selectors.button.prev,
                          ),
                          onClick: () => setViewDate(getViewDatePage(view, viewDate, -1)),
                          children: /* @__PURE__ */ jsx(HiArrowLeft, {}),
                        }),
                        /* @__PURE__ */ jsx("button", {
                          type: "button",
                          className: twMerge(
                            theme.popup.header.selectors.button.base,
                            theme.popup.header.selectors.button.view,
                          ),
                          onClick: () => setView(getNextView()),
                          children: getViewTitle(),
                        }),
                        /* @__PURE__ */ jsx("button", {
                          type: "button",
                          className: twMerge(
                            theme.popup.header.selectors.button.base,
                            theme.popup.header.selectors.button.next,
                          ),
                          onClick: () => setViewDate(getViewDatePage(view, viewDate, 1)),
                          children: /* @__PURE__ */ jsx(HiArrowRight, {}),
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsx("div", { className: theme.popup.view.base, children: renderView(view) }),
                (showClearButton || showTodayButton) &&
                  /* @__PURE__ */ jsxs("div", {
                    className: theme.popup.footer.base,
                    children: [
                      showClearButton &&
                        /* @__PURE__ */ jsxs("button", {
                          type: "button",
                          className: twMerge(theme.popup.footer.button.base, theme.popup.footer.button.clear),
                          onClick: () => {
                            changeSelectedDate(null, true);
                          },
                          children: [
                            /* @__PURE__ */ jsx("svg", {
                              xmlns: "http://www.w3.org/2000/svg",
                              width: "15",
                              height: "15",
                              viewBox: "0 0 15 15",
                              fill: "none",
                              children: /* @__PURE__ */ jsx("path", {
                                d: "M2.5169 7.74996L1.47274 7.74996C1.21024 7.74996 1.0819 8.06496 1.26857 8.24579L2.89607 9.87913C3.01274 9.99579 3.19357 9.99579 3.31024 9.87913L4.93774 8.25163C5.11857 8.06496 4.99024 7.74996 4.72774 7.74996L3.68357 7.74996C3.68357 5.81913 5.25274 4.24996 7.18357 4.24996C7.6444 4.24996 8.09357 4.33746 8.49607 4.50663C8.70607 4.59413 8.94524 4.52996 9.10274 4.37246C9.40024 4.07496 9.29524 3.57329 8.9044 3.41579C8.37357 3.19996 7.79024 3.08329 7.18357 3.08329C4.60524 3.08329 2.5169 5.17163 2.5169 7.74996ZM10.6836 7.74996C10.6836 9.68079 9.1144 11.25 7.18357 11.25C6.72274 11.25 6.27357 11.1625 5.87107 10.9933C5.66107 10.9058 5.4219 10.97 5.2644 11.1275C4.9669 11.425 5.0719 11.9266 5.46274 12.0841C5.99357 12.3 6.5769 12.4166 7.18357 12.4166C9.7619 12.4166 11.8502 10.3283 11.8502 7.74996L12.8944 7.74996C13.1569 7.74996 13.2852 7.43496 13.0986 7.25413L11.4711 5.62663C11.3544 5.50996 11.1736 5.50996 11.0569 5.62663L9.4294 7.25413C9.24857 7.43496 9.3769 7.74996 9.6394 7.74996L10.6836 7.74996Z",
                                fill: "#6F7B87",
                              }),
                            }),
                            /* @__PURE__ */ jsx("span", { className: "ml-[8px]", children: labelClearButton }),
                          ],
                        }),
                      showTodayButton &&
                        /* @__PURE__ */ jsx("button", {
                          type: "button",
                          className: twMerge(theme.popup.footer.button.base, theme.popup.footer.button.today),
                          onClick: () => {
                            const today = /* @__PURE__ */ new Date();
                            changeSelectedDate(today, true);
                            setViewDate(today);
                          },
                          children: labelTodayButton,
                        }),
                    ],
                  }),
              ],
            }),
          }),
      ],
    }),
  });
};
const Datepicker = forwardRef(DatepickerRender);
Datepicker.displayName = "Datepicker";

export { Datepicker };
//# sourceMappingURL=Datepicker.mjs.map
