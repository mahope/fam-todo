
import React from "react";

export const metadata = {
  title: "FamTodo",
  description: "Familie to-do app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
