import type { FlowbiteDrawerTheme } from "./Drawer";
interface DrawerContext {
    id?: string;
    isOpen?: boolean;
    onClose?: () => void;
    theme: FlowbiteDrawerTheme;
}
export declare const DrawerContext: import("react").Context<DrawerContext | undefined>;
export declare function useDrawerContext(): DrawerContext;
export {};
