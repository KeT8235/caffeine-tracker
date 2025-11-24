"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton // 항상 닫기 버튼 표시
      style={
        {
          "--normal-bg": "#fff", // 밝은 배경
          "--normal-text": "#222", // 진한 텍스트(가독성)
          "--normal-border": "#e5e7eb", // 연한 테두리
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
