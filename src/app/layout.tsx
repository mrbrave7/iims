import "./globals.css";
import { PopupProvider } from "./Context/ToastProvider";
import { AdminProvider } from "./Context/AdminProvider";
import Usermodale from "./Components/Usermodale";
import Sidebar from "./Components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" webcrx="">
      <body>
        <PopupProvider>
          <AdminProvider>
            <Usermodale />
            <Sidebar />
            {children}
          </AdminProvider>
        </PopupProvider>
      </body>
    </html>
  );
}
