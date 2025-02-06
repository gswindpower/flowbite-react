"use client";

import type { ForwardRefRenderFunction, ReactNode } from "react";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { HiArrowLeft, HiArrowRight, HiCalendar } from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import { mergeDeep } from "../../helpers/merge-deep";
import { getTheme } from "../../theme-store";
import type { DeepPartial } from "../../types";
import { TextInput, type FlowbiteTextInputTheme, type TextInputProps } from "../TextInput";
import { DatepickerContext } from "./DatepickerContext";
import {
  addMonths,
  addYears,
  getFirstDateInRange,
  getFormattedDate,
  isDateEqual,
  startOfYearPeriod,
  Views,
  WeekStart,
} from "./helpers";
import type { FlowbiteDatepickerViewsDaysTheme } from "./Views/Days";
import { DatepickerViewsDays } from "./Views/Days";
import { DatepickerViewsDecades, type FlowbiteDatepickerViewsDecadesTheme } from "./Views/Decades";
import { DatepickerViewsMonth, type FlowbiteDatepickerViewsMonthsTheme } from "./Views/Months";
import { DatepickerViewsYears, type FlowbiteDatepickerViewsYearsTheme } from "./Views/Years";

export interface FlowbiteDatepickerTheme {
  root: {
    base: string;
    input?: FlowbiteTextInputTheme;
  };
  popup: FlowbiteDatepickerPopupTheme;
  views: {
    days: FlowbiteDatepickerViewsDaysTheme;
    months: FlowbiteDatepickerViewsMonthsTheme;
    years: FlowbiteDatepickerViewsYearsTheme;
    decades: FlowbiteDatepickerViewsDecadesTheme;
  };
}

export interface FlowbiteDatepickerPopupTheme {
  root: {
    base: string;
    inline: string;
    inner: string;
  };
  header: {
    base: string;
    title: string;
    selectors: {
      base: string;
      button: {
        base: string;
        prev: string;
        next: string;
        view: string;
      };
    };
  };
  view: {
    base: string;
  };
  footer: {
    base: string;
    button: {
      base: string;
      today: string;
      clear: string;
    };
  };
}

export interface DatepickerRef {
  /**
   * Focus the datepicker input.
   */
  focus: () => void;
  /**
   * Clears the datepicker value back to the defaultValue.
   */
  clear: () => void;
}

export interface DatepickerProps extends Omit<TextInputProps, "theme" | "onChange" | "value" | "defaultValue"> {
  defaultValue?: Date;
  open?: boolean;
  inline?: boolean;
  autoHide?: boolean;
  showClearButton?: boolean;
  labelClearButton?: string;
  showTodayButton?: boolean;
  labelTodayButton?: string;
  minDate?: Date;
  maxDate?: Date;
  language?: string;
  weekStart?: WeekStart;
  theme?: DeepPartial<FlowbiteDatepickerTheme>;
  onChange?: (date: Date | null) => void;
  value?: Date | null;
  label?: string;
}

const DatepickerRender: ForwardRefRenderFunction<DatepickerRef, DatepickerProps> = (
  {
    title,
    open,
    inline = false,
    autoHide = true, // Hide when selected the day
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
    return defaultValue ? getFirstDateInRange(defaultValue, minDate, maxDate) : new Date();
  }, []);

  const [isOpen, setIsOpen] = useState(open);
  const [view, setView] = useState<Views>(Views.Days);
  // selectedDate is the date selected by the user
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ?? initialDate);
  // viewDate is only for navigation
  const [viewDate, setViewDate] = useState<Date>(value ?? effectiveDefaultView);

  const inputRef = useRef<HTMLInputElement>(null);
  const datepickerRef = useRef<HTMLDivElement>(null);

  // Triggers when user select the date
  const changeSelectedDate = (date: Date | null, useAutohide: boolean) => {
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

  // Render the DatepickerView* node
  const renderView = (type: Views): ReactNode => {
    switch (type) {
      case Views.Decades:
        return <DatepickerViewsDecades theme={theme.views.decades} />;
      case Views.Years:
        return <DatepickerViewsYears theme={theme.views.years} />;
      case Views.Months:
        return <DatepickerViewsMonth theme={theme.views.months} />;
      case Views.Days:
      default:
        return <DatepickerViewsDays theme={theme.views.days} />;
    }
  };

  // Coordinate the next view based on current view (statemachine-like)
  const getNextView = (): Views => {
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

  // Get the view title based on active View
  const getViewTitle = (): string => {
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

  // Navigate to prev/next for given view's date by value
  const getViewDatePage = (view: Views, date: Date, value: number): Date => {
    switch (view) {
      case Views.Days:
        return new Date(addMonths(date, value));
      case Views.Months:
        return new Date(addYears(date, value));
      case Views.Years:
        return new Date(addYears(date, value * 10));
      case Views.Decades:
        return new Date(addYears(date, value * 100));
      default:
        return new Date(addYears(date, value * 10));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideDatepicker = datepickerRef?.current?.contains(event.target as Node);
      const clickedInsideInput = inputRef?.current?.contains(event.target as Node);

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

  const displayValue = value === null ? label : getFormattedDate(language, selectedDate || new Date());

  return (
    <DatepickerContext.Provider
      value={{
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
      }}
    >
      <div className={twMerge(theme.root.base, className)}>
        {!inline && (
          <TextInput
            theme={theme.root.input}
            icon={HiCalendar}
            ref={inputRef}
            onFocus={() => {
              if (selectedDate && !isDateEqual(viewDate, selectedDate)) {
                setViewDate(selectedDate);
              }
              setIsOpen(true);
            }}
            value={displayValue}
            readOnly
            defaultValue={initialDate ? getFormattedDate(language, initialDate) : label}
            {...props}
          />
        )}
        {(isOpen || inline) && (
          <div ref={datepickerRef} className={twMerge(theme.popup.root.base, inline && theme.popup.root.inline)}>
            <div className={theme.popup.root.inner}>
              <div className={theme.popup.header.base}>
                {title && <div className={theme.popup.header.title}>{title}</div>}
                <div className={theme.popup.header.selectors.base}>
                  <button
                    type="button"
                    className={twMerge(
                      theme.popup.header.selectors.button.base,
                      theme.popup.header.selectors.button.prev,
                    )}
                    onClick={() => setViewDate(getViewDatePage(view, viewDate, -1))}
                  >
                    <HiArrowLeft />
                  </button>
                  <button
                    type="button"
                    className={twMerge(
                      theme.popup.header.selectors.button.base,
                      theme.popup.header.selectors.button.view,
                    )}
                    onClick={() => setView(getNextView())}
                  >
                    {getViewTitle()}
                  </button>
                  <button
                    type="button"
                    className={twMerge(
                      theme.popup.header.selectors.button.base,
                      theme.popup.header.selectors.button.next,
                    )}
                    onClick={() => setViewDate(getViewDatePage(view, viewDate, 1))}
                  >
                    <HiArrowRight />
                  </button>
                </div>
              </div>
              <div className={theme.popup.view.base}>{renderView(view)}</div>
              {(showClearButton || showTodayButton) && (
                <div className={theme.popup.footer.base}>
                  {showClearButton && (
                    <button
                      type="button"
                      className={twMerge(theme.popup.footer.button.base, theme.popup.footer.button.clear)}
                      onClick={() => {
                        changeSelectedDate(null, true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path
                          d="M2.5169 7.74996L1.47274 7.74996C1.21024 7.74996 1.0819 8.06496 1.26857 8.24579L2.89607 9.87913C3.01274 9.99579 3.19357 9.99579 3.31024 9.87913L4.93774 8.25163C5.11857 8.06496 4.99024 7.74996 4.72774 7.74996L3.68357 7.74996C3.68357 5.81913 5.25274 4.24996 7.18357 4.24996C7.6444 4.24996 8.09357 4.33746 8.49607 4.50663C8.70607 4.59413 8.94524 4.52996 9.10274 4.37246C9.40024 4.07496 9.29524 3.57329 8.9044 3.41579C8.37357 3.19996 7.79024 3.08329 7.18357 3.08329C4.60524 3.08329 2.5169 5.17163 2.5169 7.74996ZM10.6836 7.74996C10.6836 9.68079 9.1144 11.25 7.18357 11.25C6.72274 11.25 6.27357 11.1625 5.87107 10.9933C5.66107 10.9058 5.4219 10.97 5.2644 11.1275C4.9669 11.425 5.0719 11.9266 5.46274 12.0841C5.99357 12.3 6.5769 12.4166 7.18357 12.4166C9.7619 12.4166 11.8502 10.3283 11.8502 7.74996L12.8944 7.74996C13.1569 7.74996 13.2852 7.43496 13.0986 7.25413L11.4711 5.62663C11.3544 5.50996 11.1736 5.50996 11.0569 5.62663L9.4294 7.25413C9.24857 7.43496 9.3769 7.74996 9.6394 7.74996L10.6836 7.74996Z"
                          fill="#6F7B87"
                        />
                      </svg>
                      <span className="ml-[8px]">{labelClearButton}</span>
                    </button>
                  )}
                  {showTodayButton && (
                    <button
                      type="button"
                      className={twMerge(theme.popup.footer.button.base, theme.popup.footer.button.today)}
                      onClick={() => {
                        const today = new Date();
                        changeSelectedDate(today, true);
                        setViewDate(today);
                      }}
                    >
                      {labelTodayButton}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DatepickerContext.Provider>
  );
};

export const Datepicker = forwardRef(DatepickerRender);

Datepicker.displayName = "Datepicker";
