import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
                <Topbar />
                <main className="flex-1 overflow-y-auto bg-secondary/30 p-6">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
