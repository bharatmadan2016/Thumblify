import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SoftBackdrop from "../components/SoftBackdrop";
import { useAppContext } from "../context/AppContext";
import { BarChart3, Download, ExternalLink } from "lucide-react";

const MyGeneration = () => {
    const { token, isAuthenticated } = useAppContext();
    const navigate = useNavigate();
    const [thumbnails, setThumbnails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchHistory();
    }, [isAuthenticated, navigate]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5001/api/thumbnails/my', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setThumbnails(result.data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SoftBackdrop />
            <div className="pt-24 min-h-screen">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">My Generations</h1>
                        <p className="text-zinc-400">View and track your previous thumbnails and their performance scores.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="size-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                        </div>
                    ) : thumbnails.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {thumbnails.map((item) => (
                                <div key={item._id} className="group rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-md transition-all hover:border-white/20">
                                    <div className="relative aspect-video overflow-hidden">
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={item.imageUrl} download target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-black/60 text-white hover:bg-black/80">
                                                <Download className="size-4" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-white font-medium mb-3 truncate" title={item.title}>{item.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BarChart3 className="size-4 text-emerald-400" />
                                                <span className="text-xs text-zinc-400">CTR Score:</span>
                                                <span className="text-sm font-bold text-emerald-400">{item.ctrScore}%</span>
                                            </div>
                                            <span className="text-[10px] text-zinc-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/generate`)}
                                            className="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink className="size-3" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 rounded-3xl border-2 border-dashed border-white/5 bg-white/2">
                            <h3 className="text-lg text-zinc-400">No thumbnails generated yet</h3>
                            <button 
                                onClick={() => navigate('/generate')}
                                className="mt-4 text-pink-500 hover:underline"
                            >
                                Start generating now
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default MyGeneration;