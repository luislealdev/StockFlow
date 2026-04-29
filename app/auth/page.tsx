import { LoginForm } from './ui/LoginForm';

const LoginPage = () => {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </main>
    );
};

export default LoginPage;