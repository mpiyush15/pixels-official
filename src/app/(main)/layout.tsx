import Navbar from "@/components/Navbar";
import Script from "next/script";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      {/* Cashfree Checkout Script */}
      <Script 
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
      />
    </>
  );
}
