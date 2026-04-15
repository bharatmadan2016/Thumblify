import { useState, useEffect } from "react";
import { Star, MessageSquare, Send } from "lucide-react";

export default function ReviewSection() {
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/reviews");
            const result = await response.json();
            if (result.success) {
                setReviews(result.data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !content) return alert("Please fill in all fields");

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, content, rating })
            });
            const result = await response.json();
            if (result.success) {
                setName("");
                setContent("");
                setRating(5);
                fetchReviews();
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-24 px-4 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-[1fr_450px] gap-16">
                    {/* Left: Review List */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Customer Feedback</h2>
                            <p className="text-zinc-500">Real stories from creators who transformed their channels.</p>
                        </div>

                        <div className="grid gap-6">
                            {reviews.map((review) => (
                                <div key={review._id} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-left-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={review.avatar} alt={review.name} className="size-12 rounded-full ring-2 ring-pink-500/20" />
                                        <div>
                                            <h4 className="font-bold text-white">{review.name}</h4>
                                            <div className="flex gap-0.5 text-yellow-500">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="size-3 fill-current" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed italic">"{review.content}"</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Review Form */}
                    <div className="sticky top-24 h-fit">
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <MessageSquare className="size-5 text-pink-500" />
                                Share Your Experience
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Your Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all"
                                        placeholder="Alex Johnson"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button 
                                                key={s} 
                                                type="button" 
                                                onClick={() => setRating(s)}
                                                className={`size-10 rounded-lg flex items-center justify-center transition-all ${rating >= s ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-zinc-600'}`}
                                            >
                                                <Star className={`size-5 ${rating >= s ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Message</label>
                                    <textarea 
                                        rows={4}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all resize-none"
                                        placeholder="How has Thumblify helped your channel?"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? "Submitting..." : (
                                        <>
                                            <Send className="size-5" />
                                            Post Review
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
