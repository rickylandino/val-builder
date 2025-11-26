import ReactDOM from "react-dom";
import React, { useEffect, useRef } from "react";
// Removed ReactDOM import

interface CustomDrawerProps {
  open: boolean;
  children: React.ReactNode;
  overlayColor?: string;
}

export const CustomDrawer: React.FC<CustomDrawerProps> = ({
  open,
  children,
  overlayColor = "rgba(0,0,0,0.5)",
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && drawerRef.current) {
      // Trigger reflow for transition
      drawerRef.current.style.transform = "translateX(0)";
    }
  }, [open]);

  if (!open) return null;
  return ReactDOM.createPortal(
    <div
      className="custom-drawer-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 40,
        background: overlayColor,
        pointerEvents: "none",
      }}
    >
      <div
        ref={drawerRef}
        className="custom-drawer-content"
        style={{
          width: "100vw",
          height: "100vh",
          background: "#fff",
          boxShadow: "2px 0 24px rgba(0,0,0,0.2)",
          position: "fixed",
          top: 0,
          left: 0,
          overflow: "auto",
          transform: open ? "translateX(0)" : "translateX(-100vw)",
          transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
          pointerEvents: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
