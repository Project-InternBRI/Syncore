import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
                <Sidebar />
                
                <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    <Header />
                    
                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto p-8 relative">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
