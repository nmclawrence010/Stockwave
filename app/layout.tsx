"use client";

import "./globals.css";
import "./data-tables-css.css";
import "./satoshi.css";
import Loader from "@/components/common/Loader";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { UserProvider, useUser } from "@auth0/nextjs-auth0/client";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 5000);
  }, []);

  return (
    <html lang="en" className="dark">
      <UserProvider>
        <body suppressHydrationWarning={true}>
          <div className="dark:bg-simplybackground dark:text-bodydark">
            {loading ? (
              <Loader />
            ) : (
              <div className="flex h-screen overflow-hidden">
                {/* <!-- ===== Sidebar Start ===== --> */}
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                {/* <!-- ===== Sidebar End ===== --> */}

                {/* <!-- ===== Content Area Start ===== --> */}
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                  {/* <!-- ===== Header Start ===== --> */}
                  <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                  {/* <!-- ===== Header End ===== --> */}

                  {/* <!-- ===== Main Content Start ===== --> */}
                  <main>
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:px-10">{children}</div>
                  </main>
                  {/* <!-- ===== Main Content End ===== --> */}
                </div>
                {/* <!-- ===== Content Area End ===== --> */}
              </div>
            )}
          </div>
        </body>
      </UserProvider>
    </html>
  );
}
