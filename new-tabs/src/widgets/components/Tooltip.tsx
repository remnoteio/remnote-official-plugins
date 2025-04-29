import { PropsWithChildren } from "react";

interface TooltipProps {
  message: string;
}

const Tooltip = ({ children, message }: PropsWithChildren<TooltipProps>) => (
  <span className="tooltip" data-tooltip={message}>
    {children}
  </span>
);

export default Tooltip;
