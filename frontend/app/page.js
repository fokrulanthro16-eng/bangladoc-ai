export default function Home() {
    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-4">BanglaDoc AI 🚀</h1>
                <p className="text-lg mb-6">AI powered Bangla document editor</p>

                <div className="space-x-4">
                    <a
                        href="/login"
                        className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold"
                    >
                        Login
                    </a>

                    <a
                        href="/signup"
                        className="border border-white px-6 py-2 rounded-lg"
                    >
                        Signup
                    </a>
                </div>
            </div>
        </div>
    );
}