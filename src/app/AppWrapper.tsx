"use client";

import ClientLayout from "./client-layout";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
