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
            <main className="fixed top-0 left-0 w-screen h-screen">
              {children}
            </main>
          </AdminProvider>
        </PopupProvider>
      </body>
    </html>
  );
}
