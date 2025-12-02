import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState } from "react";
// Removed ReactDOM import

interface CustomDrawerProps {
  open: boolean;
  children: React.ReactNode;
  overlayColor?: string;
  width?: string;
  direction?: "ltr" | "rtl";
}
export const CustomDrawer: React.FC<CustomDrawerProps> = ({
  open,
  children,
  overlayColor = "rgba(0,0,0,0.5)",
  width = "100vw",
  direction = "ltr"
}) => {
  const [visible, setVisible] = useState(open);
  const [slideIn, setSlideIn] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setTimeout(() => setSlideIn(true), 10); // trigger slide in after mount
    } else {
      setSlideIn(false);
      // Wait for animation to finish before unmounting
      const timeout = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!visible) return null;

  // Calculate transform value outside JSX to avoid nested ternary and template literals
  let transformValue = "translateX(0)";
  if (!slideIn) {
    if (direction === "ltr") {
      transformValue = `translateX(${width})`;
    } else {
      transformValue = `translateX(-${width})`;
    }
  }

  return ReactDOM.createPortal(
    <div
      className="custom-drawer-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: direction === "rtl" ? 0 : "auto",
        right: direction === "ltr" ? 0 : "auto",
        width: width,
        height: "100vh",
        zIndex: 60,
        background: open ? overlayColor : "rgba(0,0,0,0)",
        opacity: open ? 1 : 0,
        transition: "opacity 0.35s cubic-bezier(.4,0,.2,1)",
        pointerEvents: open ? "auto" : "none",
        display: "flex",
        justifyContent: direction === "rtl" ? "flex-start" : "flex-end",
      }}
    >
      <div
        ref={drawerRef}
        className="custom-drawer-content"
        style={{
          width: width,
          height: "100vh",
          background: "#fff",
          boxShadow: "2px 0 24px rgba(0,0,0,0.2)",
          position: "relative",
          overflow: "auto",
          transform: transformValue,
          transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
          pointerEvents: "auto",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
