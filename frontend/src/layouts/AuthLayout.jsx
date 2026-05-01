const AuthLayout = ({ children }) => {
    return (
        <div className='min-h-screen flex items-center justify-center px-4 py-8 text-white relative overflow-hidden'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.20),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.15),_transparent_30%),linear-gradient(135deg,_#06111f_0%,_#0a1a2b_38%,_#10263d_72%,_#18344c_100%)]'></div>
            <div className='absolute top-10 left-10 w-52 h-52 rounded-full bg-cyan-400/10 blur-3xl'></div>
            <div className='absolute bottom-10 right-10 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl'></div>

            <div className='relative z-10 w-full max-w-2xl glass-panel p-6 sm:p-8 md:p-10'>
                <div className="mb-6 text-center">
                    <h2 className="text-lg font-semibold tracking-wide bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">Herboscope</h2>
                    <p className="mt-2 text-sm text-slate-200/75">A modern herbal companion for plant discovery and recognition</p>
                </div>
                {children}
            </div>
        </div>
    )
}

export default AuthLayout;