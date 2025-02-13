import { Inter } from "next/font/google";

import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/store/store";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Web calendar",
  description:
    "Web calendar by NextJS. It's a simple web calendar for planning you life/work/hobbies. Just use it if you sometimes can't remind something",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-[#F2F5F7] overflow-hidden"}>
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
