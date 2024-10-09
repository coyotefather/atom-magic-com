export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
	<html lang="en">
	  <body>
		<div className="grow">
		  {children}
		</div>
	  </body>
	</html>
  );
}