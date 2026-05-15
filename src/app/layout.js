import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Museum Bengkulu Explorer",
  description: "QR museum Bengkulu",
};
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
