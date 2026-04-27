import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
    >
      <body className="min-h-full flex flex-col">{children}</body>
      <Toaster />
    </html>
  );
}
