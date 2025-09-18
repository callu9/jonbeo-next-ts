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
				<MSWComponent>{children}</MSWComponent>
			</body>
		</html>
	);
}
