import "../globals.css";
import 'easymde/dist/easymde.min.css'

export { metadata, viewport } from "next-sanity/studio";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
	<html lang="en">
	  <body className="min-h-screen">
		  {children}
	  </body>
	</html>
  );
}