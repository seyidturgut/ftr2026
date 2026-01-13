import Footer from "@/components/Footer";

export default function ContentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
