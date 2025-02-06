import type { ElementType } from "react";
import { type ReactNode } from "react";
import type { PolymorphicComponentPropWithRef } from "../../helpers/generic-as-prop";
import type { DeepPartial, DynamicStringEnumKeysOf } from "../../types";
import type { FlowbiteBoolean, FlowbiteColors, FlowbiteGradientColors, FlowbiteGradientDuoToneColors, FlowbiteSizes } from "../Flowbite";
import type { PositionInButtonGroup } from "./ButtonGroup";
export interface FlowbiteButtonTheme {
    base: string;
    fullSized: string;
    color: FlowbiteColors;
    disabled: string;
    isProcessing: string;
    spinnerSlot: string;
    spinnerLeftPosition: ButtonSizes;
    gradient: ButtonGradientColors;
    gradientDuoTone: ButtonGradientDuoToneColors;
    inner: FlowbiteButtonInnerTheme;
    label: string;
    outline: FlowbiteButtonOutlineTheme;
    pill: FlowbiteBoolean;
    size: ButtonSizes;
}
export interface FlowbiteButtonInnerTheme {
    base: string;
    position: PositionInButtonGroup;
    outline: string;
    isProcessingPadding: ButtonSizes;
}
export interface FlowbiteButtonOutlineTheme extends FlowbiteBoolean {
    color: ButtonOutlineColors;
    pill: FlowbiteBoolean;
}
export interface ButtonColors extends Pick<FlowbiteColors, "dark" | "failure" | "gray" | "info" | "light" | "purple" | "success" | "warning"> {
    [key: string]: string;
}
export interface ButtonGradientColors extends FlowbiteGradientColors {
    [key: string]: string;
}
export interface ButtonGradientDuoToneColors extends FlowbiteGradientDuoToneColors {
    [key: string]: string;
}
export interface ButtonOutlineColors extends Pick<FlowbiteColors, "gray"> {
    [key: string]: string;
}
export interface ButtonSizes extends Pick<FlowbiteSizes, "xs" | "sm" | "lg" | "xl"> {
    [key: string]: string;
}
export type ButtonProps<T extends ElementType = "button"> = PolymorphicComponentPropWithRef<T, {
    href?: string;
    color?: DynamicStringEnumKeysOf<FlowbiteColors>;
    fullSized?: boolean;
    gradientDuoTone?: DynamicStringEnumKeysOf<ButtonGradientDuoToneColors>;
    gradientMonochrome?: DynamicStringEnumKeysOf<ButtonGradientColors>;
    target?: string;
    isProcessing?: boolean;
    processingLabel?: string;
    processingSpinner?: ReactNode;
    label?: ReactNode;
    outline?: boolean;
    pill?: boolean;
    positionInGroup?: keyof PositionInButtonGroup;
    size?: DynamicStringEnumKeysOf<ButtonSizes>;
    theme?: DeepPartial<FlowbiteButtonTheme>;
}>;
export declare const Button: (<C extends ElementType = "button">(props: ButtonProps<C>) => JSX.Element) & {
    displayName?: string;
} & {
    Group: import("react").FC<import("./ButtonGroup").ButtonGroupProps>;
};
