import { auth } from '@/auth.config';
import { Sidebar } from './ui/Sidebar';
import { redirect } from 'next/navigation';

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await auth();
    if (!session) {
        redirect('/auth');
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
            <Sidebar />

            <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
