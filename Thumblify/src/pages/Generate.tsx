import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colorSchemes, type AspectRatio, type IThumbnail, type ThumbnailStyle } from "../assets/assets"
import SoftBackdrop from "../components/SoftBackdrop";
import AspectRatioSelector from "../components/AspectRatioSelector";
import StyleSelector from "../components/StyleSelector";
import ColorSchemeSelector from "../components/ColorSchemeSelector";
import { Sparkles, BarChart3, Download, Share2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Generate = () => {
    const { id } = useParams();
    const { token, isAuthenticated } = useAppContext();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [thumbnail, setThumbnail] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [aspectRatio, SetAspectRatio] = useState<AspectRatio>('16:9')
    const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id)
    const [style, setStyle] = useState<ThumbnailStyle>('Bold & Graphic')
    const [styleDropdownOpen, setStyleDropdownOpen] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleGenerate = async () => {
        if (!title) return alert("Please enter a title");
        
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/thumbnails/generate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    style,
                    aspectRatio,
                    colorSchemeId,
                    additionalDetails
                })
            });
            const result = await response.json();
            if (result.success) {
                setThumbnail(result.data);
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error generating thumbnail:", error);
            alert("Failed to connect to backend");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SoftBackdrop />
            <div className="pt-24 min-h-screen">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
                    <div className="grid lg:grid-cols-[400px_1fr] gap-8">
                        {/* LEFT PANEL */}
                        <div className={`space-y-6 ${id && 'pointer-events-none'}`}>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-1"> Create your Thumbnail</h2>
                                    <p className="text-sm text-zinc-400"> Describe your vision and let AI bring it to life</p>
                                </div>

                                <div className="space-y-5">
                                    {/* TITLE INPUT */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-zinc-300">Title or Topic</label>
                                        <input 
                                            type="text" 
                                            value={title} 
                                            onChange={(e) => setTitle(e.target.value)} 
                                            maxLength={100} 
                                            placeholder="e.g., 10 Tips for Better Sleep" 
                                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                                        />
                                        <div className="flex justify-end">
                                            <span className="text-xs text-zinc-500">{title.length}/100</span>
                                        </div>
                                    </div>

                                    {/* Selectors */}
                                    <AspectRatioSelector value={aspectRatio} onChange={SetAspectRatio} />
                                    <StyleSelector value={style} onChange={setStyle} isOpen={styleDropdownOpen} setIsOpen={setStyleDropdownOpen} />
                                    <ColorSchemeSelector value={colorSchemeId} onChange={setColorSchemeId} />

                                    {/* DETAILS */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-zinc-300">
                                            Additional Prompts <span className="text-zinc-500 text-xs">(optional)</span>
                                        </label>
                                        <textarea 
                                            value={additionalDetails} 
                                            onChange={(e) => setAdditionalDetails(e.target.value)} 
                                            rows={3} 
                                            placeholder="Add any specific elements, mood, or style preferences..." 
                                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* BUTTON */}
                                {!id && (
                                    <button 
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="relative group w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:from-pink-600 group-hover:to-purple-700 transition-all" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Generating Artifact...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="size-5" />
                                                    Generate Thumbnail
                                                </>
                                            )}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* RIGHT PANEL - RESULT */}
                        <div className="space-y-6">
                            {thumbnail ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                        <img 
                                            src={thumbnail.imageUrl} 
                                            alt={thumbnail.title} 
                                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                            <h3 className="text-2xl font-bold text-white">{thumbnail.title}</h3>
                                        </div>
                                    </div>

                                    {/* ANALYTICS BAR */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                                    <BarChart3 className="size-5" />
                                                </div>
                                                <span className="text-sm font-medium text-zinc-400">Estimated CTR</span>
                                            </div>
                                            <div className="text-3xl font-bold text-white">{thumbnail.ctrScore}%</div>
                                            <p className="text-xs text-zinc-500 mt-1">Based on visual heuristics</p>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                                    <Sparkles className="size-5" />
                                                </div>
                                                <span className="text-sm font-medium text-zinc-400">Quality Score</span>
                                            </div>
                                            <div className="text-3xl font-bold text-white">{thumbnail.metrics.colorfulness.toFixed(0)}/100</div>
                                            <p className="text-xs text-zinc-500 mt-1">Color balance & impact</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
                                                <Download className="size-5" />
                                                Download
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
                                                <Share2 className="size-5" />
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[500px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/2">
                                    <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Sparkles className="size-10 text-zinc-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-zinc-400">Ready to Visualize?</h3>
                                    <p className="text-zinc-600 mt-1 max-w-xs text-center px-4">Fill out the details on the left to generate your custom AI thumbnail.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}

export default Generate
  