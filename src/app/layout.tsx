import { initMocks } from "../mocks";
import { MSWComponent } from "@/providers/MSWComponent";
import { pretendard } from "../../theme";
import "./globals.css";

initMocks();

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
            <MSWComponent>{children}</MSWComponent>
          </div>
        </div>
      </body>
    </html>
  );
}
