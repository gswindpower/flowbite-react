'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var fa6 = require('react-icons/fa6');
var tailwindMerge = require('tailwind-merge');
var mergeDeep = require('../../helpers/merge-deep.cjs');
var index = require('../../theme-store/index.cjs');
var helpers = require('./helpers.cjs');

const ClipboardWithIconText = React.forwardRef(
  ({ valueToCopy, icon: Icon = fa6.FaClipboardList, label = "Copy", theme: customTheme = {}, className, ...rest }, ref) => {
    const [isJustCopied, setIsJustCopied] = React.useState(false);
    const theme = mergeDeep.mergeDeep(index.getTheme().clipboard.withIconText, customTheme);
    return /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: tailwindMerge.twMerge(theme.base, className),
        onClick: () => helpers.copyToClipboard(valueToCopy, setIsJustCopied),
        ...rest,
        ref,
        children: isJustCopied ? /* @__PURE__ */ jsxRuntime.jsxs("span", { className: theme.label.base, children: [
          /* @__PURE__ */ jsxRuntime.jsx(fa6.FaCheck, { "aria-hidden": true, className: theme.icon.successIcon }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: theme.label.successText, children: "Copied" })
        ] }) : /* @__PURE__ */ jsxRuntime.jsxs("span", { className: theme.label.base, children: [
          /* @__PURE__ */ jsxRuntime.jsx(Icon, { "aria-hidden": true, className: theme.icon.defaultIcon }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: theme.label.defaultText, children: label })
        ] })
      }
    );
  }
);

exports.ClipboardWithIconText = ClipboardWithIconText;
//# sourceMappingURL=ClipboardWithIconText.cjs.map
