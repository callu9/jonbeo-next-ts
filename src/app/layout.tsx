import Providers from "@/providers/providers";
import { pretendard } from "../../theme";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pretendard.className} font-medium`}>
        <div className="flex-center">
          <div className="min-h-screen w-screen md:max-w-[48rem] md:shadow-lg dark:shadow-gray-600">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
