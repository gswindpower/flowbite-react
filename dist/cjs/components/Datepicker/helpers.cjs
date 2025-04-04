'use strict';

var Views = /* @__PURE__ */ ((Views2) => {
  Views2[Views2["Days"] = 0] = "Days";
  Views2[Views2["Months"] = 1] = "Months";
  Views2[Views2["Years"] = 2] = "Years";
  Views2[Views2["Decades"] = 3] = "Decades";
  return Views2;
})(Views || {});
var WeekStart = /* @__PURE__ */ ((WeekStart2) => {
  WeekStart2[WeekStart2["Sunday"] = 0] = "Sunday";
  WeekStart2[WeekStart2["Monday"] = 1] = "Monday";
  WeekStart2[WeekStart2["Tuesday"] = 2] = "Tuesday";
  WeekStart2[WeekStart2["Wednesday"] = 3] = "Wednesday";
  WeekStart2[WeekStart2["Thursday"] = 4] = "Thursday";
  WeekStart2[WeekStart2["Friday"] = 5] = "Friday";
  WeekStart2[WeekStart2["Saturday"] = 6] = "Saturday";
  return WeekStart2;
})(WeekStart || {});
const isDateInRange = (date, minDate, maxDate) => {
  const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (minDate && maxDate) {
    const minDateTime = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime();
    const maxDateTime = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime();
    return dateTime >= minDateTime && dateTime <= maxDateTime;
  }
  if (minDate) {
    const minDateTime = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime();
    return dateTime >= minDateTime;
  }
  if (maxDate) {
    const maxDateTime = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime();
    return dateTime <= maxDateTime;
  }
  return true;
};
const isDateEqual = (date, selectedDate) => {
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  return date.getTime() === selectedDate.getTime();
};
const getFirstDateInRange = (date, minDate, maxDate) => {
  if (!isDateInRange(date, minDate, maxDate)) {
    if (minDate && date < minDate) {
      date = minDate;
    } else if (maxDate && date > maxDate) {
      date = maxDate;
    }
  }
  return date;
};
const getFirstDayOfTheMonth = (date, weekStart) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  let diff = dayOfWeek - weekStart;
  if (diff < 0) {
    diff += 7;
  }
  return addDays(firstDayOfMonth, -diff);
};
const getWeekDays = (lang, weekStart) => {
  const weekdays = [];
  const date = /* @__PURE__ */ new Date(0);
  date.setDate(date.getDate() - date.getDay() + weekStart);
  const formatter = new Intl.DateTimeFormat(lang, { weekday: "short" });
  for (let i = 0; i < 7; i++) {
    weekdays.push(formatter.format(addDays(date, i)));
  }
  return weekdays;
};
const addDays = (date, amount) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + amount);
  return newDate;
};
const addMonths = (date, amount) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + amount);
  return newDate;
};
const addYears = (date, amount) => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + amount);
  return newDate;
};
const convertKoreanDateToISO = (dateStr) => {
  const match = dateStr.match(/(\d{4}).\s*(\d{2}).\s*(\d{2})./);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
};
const getFormattedDate = (language, date, options) => {
  let defaultOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  };
  if (options) {
    defaultOptions = options;
  }
  const formattedDate = convertKoreanDateToISO(new Intl.DateTimeFormat(language, defaultOptions).format(date));
  return formattedDate.length <= 3 ? formattedDate.replace("\uC77C", "").trim() : formattedDate;
};
const startOfYearPeriod = (date, years) => {
  const year = date.getFullYear();
  return Math.floor(year / years) * years;
};
const isDateInDecade = (date, startYear) => {
  const year = date.getFullYear();
  const endYear = startYear + 9;
  return year >= startYear && year <= endYear;
};

exports.Views = Views;
exports.WeekStart = WeekStart;
exports.addDays = addDays;
exports.addMonths = addMonths;
exports.addYears = addYears;
exports.convertKoreanDateToISO = convertKoreanDateToISO;
exports.getFirstDateInRange = getFirstDateInRange;
exports.getFirstDayOfTheMonth = getFirstDayOfTheMonth;
exports.getFormattedDate = getFormattedDate;
exports.getWeekDays = getWeekDays;
exports.isDateEqual = isDateEqual;
exports.isDateInDecade = isDateInDecade;
exports.isDateInRange = isDateInRange;
exports.startOfYearPeriod = startOfYearPeriod;
//# sourceMappingURL=helpers.cjs.map
