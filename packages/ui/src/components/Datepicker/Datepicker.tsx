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
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                        <g clip-path="url(#clip0_1366_2754)">
                          <path
                            d="M12.453 6.31675L10.593 8.17675C10.3797 8.39008 10.5264 8.75008 10.8264 8.75008H12.0197C12.0197 10.9567 10.2264 12.7501 8.01971 12.7501C7.49305 12.7501 6.97971 12.6501 6.51971 12.4567C6.27971 12.3567 6.00638 12.4301 5.82638 12.6101C5.48638 12.9501 5.60638 13.5234 6.05305 13.7034C6.65971 13.9501 7.32638 14.0834 8.01971 14.0834C10.9664 14.0834 13.353 11.6967 13.353 8.75008H14.5464C14.8464 8.75008 14.993 8.39008 14.7797 8.18341L12.9197 6.32341C12.793 6.19008 12.5797 6.19008 12.453 6.31675ZM4.01971 8.75008C4.01971 6.54341 5.81305 4.75008 8.01971 4.75008C8.54638 4.75008 9.05971 4.85008 9.51971 5.04341C9.75972 5.14341 10.033 5.07008 10.213 4.89008C10.553 4.55008 10.433 3.97675 9.98638 3.79675C9.37971 3.55008 8.71305 3.41675 8.01971 3.41675C5.07305 3.41675 2.68638 5.80341 2.68638 8.75008H1.49305C1.19305 8.75008 1.04638 9.11008 1.25971 9.31675L3.11971 11.1767C3.25305 11.3101 3.45971 11.3101 3.59305 11.1767L5.45305 9.31675C5.65971 9.11008 5.51305 8.75008 5.21305 8.75008H4.01971Z"
                            fill="white"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1366_2754">
                            <rect width="16" height="16" fill="white" transform="translate(0.0197754 0.75)" />
                          </clipPath>
                        </defs>
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
