import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils/cn";
export default function Badge({ className, children }) {
    return (_jsx("span", { className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", className), children: children }));
}
