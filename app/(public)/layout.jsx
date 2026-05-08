import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
