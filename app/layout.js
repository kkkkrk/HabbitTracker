import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Habit Tracker - 나의 매일 습관 기록장",
  description: "매일 반복되는 습관을 기록하고 한 눈에 통계로 확인하세요.",
  keywords: ["습관", "해빗 트래커", "목표", "루틴", "기록", "통계", "habit tracker", "routine"],
  authors: [{ name: "Habit Tracker" }],
  creator: "Habit Tracker",
  openGraph: {
    title: "Habit Tracker",
    description: "매일 반복되는 습관을 기록하고 한 눈에 확인하세요.",
    url: "https://habbit-tracker-red.vercel.app",
    siteName: "Habit Tracker",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Habit Tracker Logo",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habit Tracker",
    description: "매일 반복되는 습관을 기록하고 한 눈에 확인하세요.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "cjtG0EKVLMzCjmKMCMXaR8iCb5lMC20Hnf9jrg7qVXE",
    other: {
      "naver-site-verification": ["64de38754a72e075b000db785e0803fcf9340671"],
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
