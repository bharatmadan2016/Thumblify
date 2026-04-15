import { Github, Twitter, Linkedin, Mail, Search } from "lucide-react";

export default function Footer() {
    return (
        <footer className="footer bg-black/50 border-t border-white/10 pt-16 pb-8 px-4 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xl font-black text-white">T</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Thumblify</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Empowering creators with AI-driven thumbnails that demand attention and drive clicks. Start your journey to viral success today.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all">
                                    <Icon className="size-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li><a href="#" className="hover:text-pink-500 transition-colors">Thumbnail Generator</a></li>
                            <li><a href="#" className="hover:text-pink-500 transition-colors">A/B Testing</a></li>
                            <li><a href="#" className="hover:text-pink-500 transition-colors">CTR Predictor</a></li>
                            <li><a href="#" className="hover:text-pink-500 transition-colors">Templates</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li><a href="#" className="hover:text-pink-500 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-pink-500 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-pink-500 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-pink-500 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold">Stay Updated</h4>
                        <p className="text-zinc-500 text-sm">Subscribe to get the latest tips on growing your channel.</p>
                        <div className="relative">
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                            />
                            <button className="absolute right-2 top-2 px-3 py-1 rounded-lg bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
                    <p>© 2026 Thumblify AI. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white">Security</a>
                        <a href="#" className="hover:text-white">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}