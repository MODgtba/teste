import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, Search, Mic, Video as VideoIcon, Bell, User, Home, Compass, PlaySquare, Clock, ThumbsUp, MoreVertical, Share2, Download, Scissors, MoreHorizontal, LayoutGrid, Radio, Play, Loader2, AlertCircle, Settings } from 'lucide-react';
import { generateVideos, generateVideoDetails, searchSuggestion, generateRealVideo } from './services/geminiService';
import { Video, Category, VideoDetail } from './types';

// --- Components ---

// 1. Header
const Header = ({ 
  onSearch, 
  onMenuClick, 
  onLogoClick 
}: { 
  onSearch: (q: string) => void; 
  onMenuClick: () => void;
  onLogoClick: () => void;
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Debounce suggestion
  useEffect(() => {
    const timer = setTimeout(() => {
        if(query.length > 2) {
             searchSuggestion(query).then(setSuggestions);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(query.trim()) {
        onSearch(query);
        setShowSuggestions(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-yt-dark flex items-center justify-between px-4 z-50 border-b border-transparent">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 hover:bg-yt-hover rounded-full">
          <Menu className="w-6 h-6 text-white" />
        </button>
        <div onClick={onLogoClick} className="flex items-center gap-1 cursor-pointer" title="YouClone Home">
          <div className="w-8 h-6 bg-red-600 rounded-lg flex items-center justify-center relative overflow-hidden">
             <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white font-sans">YouClone</span>
        </div>
      </div>

      <div className="hidden sm:flex flex-1 max-w-[720px] items-center gap-4 ml-10">
        <form onSubmit={handleSubmit} className="flex flex-1 relative">
          <div className="flex flex-1 items-center">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search" 
              className="w-full bg-[#121212] border border-yt-border rounded-l-full py-2 px-4 text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-yt-gray border border-yt-border rounded-lg mt-1 shadow-lg py-2">
                    {suggestions.map((s, i) => (
                        <div key={i} className="px-4 py-1 hover:bg-yt-hover cursor-pointer text-white flex gap-2 items-center"
                             onClick={() => { setQuery(s); onSearch(s); }}>
                            <Search className="w-4 h-4 text-yt-textSec" />
                            {s}
                        </div>
                    ))}
                </div>
            )}
          </div>
          <button type="submit" className="bg-[#222222] border border-l-0 border-yt-border rounded-r-full px-5 py-2 hover:bg-yt-hover tooltip" title="Search">
            <Search className="w-5 h-5 text-white" />
          </button>
        </form>
        <button className="p-2.5 bg-[#181818] hover:bg-yt-hover rounded-full">
          <Mic className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="hidden sm:block p-2 hover:bg-yt-hover rounded-full">
          <VideoIcon className="w-6 h-6 text-white" />
        </button>
        <button className="hidden sm:block p-2 hover:bg-yt-hover rounded-full">
          <Bell className="w-6 h-6 text-white" />
        </button>
        <button className="px-2 py-1 flex items-center gap-2 hover:bg-yt-hover rounded-full">
           <img src="https://picsum.photos/seed/me/40/40" alt="User" className="w-8 h-8 rounded-full" />
        </button>
      </div>
    </header>
  );
};

// 2. Sidebar
const Sidebar = ({ isOpen, activeTab, onNavigate, onOpenKeySettings }: { isOpen: boolean, activeTab: string, onNavigate: (t: string) => void, onOpenKeySettings: () => void }) => {
  const items = [
    { icon: Home, label: "Home", id: 'home' },
    { icon: Radio, label: "Shorts", id: 'shorts' },
    { icon: Compass, label: "Subscriptions", id: 'subs' },
    { icon: LayoutGrid, label: "You", id: 'library' },
  ];

  const secondaryItems = [
    { icon: Clock, label: "History" },
    { icon: PlaySquare, label: "Your videos" },
    { icon: Clock, label: "Watch later" },
    { icon: ThumbsUp, label: "Liked videos" },
  ];

  if (!isOpen) {
    return (
      <aside className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-[72px] bg-yt-dark hover:overflow-y-auto pt-2 z-40">
        {items.map((item) => (
          <div key={item.label} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-yt-hover rounded-lg mx-1 ${activeTab === item.id ? 'text-white' : 'text-yt-text'}`}>
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[10px]">{item.label}</span>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-yt-dark overflow-y-auto hover:overflow-y-auto px-3 pb-4 z-40 border-r border-transparent">
      <div className="py-2 border-b border-yt-border space-y-1">
        {items.map((item) => (
          <div key={item.label} onClick={() => onNavigate(item.id)} className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer hover:bg-yt-hover ${activeTab === item.id ? 'bg-yt-hover font-medium' : ''}`}>
            <item.icon className={`w-6 h-6 mr-5 ${activeTab === item.id ? 'fill-white' : ''}`} />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="py-2 border-b border-yt-border space-y-1">
        <h3 className="px-3 py-2 text-base font-medium flex items-center">You <span className="text-xs ml-1">›</span></h3>
        {secondaryItems.map((item) => (
          <div key={item.label} className="flex items-center px-3 py-2.5 rounded-lg cursor-pointer hover:bg-yt-hover">
            <item.icon className="w-6 h-6 mr-5" />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
        <div onClick={onOpenKeySettings} className="flex items-center px-3 py-2.5 rounded-lg cursor-pointer hover:bg-yt-hover text-red-400">
           <Settings className="w-6 h-6 mr-5" />
           <span className="text-sm font-medium">Billing / API Key</span>
        </div>
      </div>
      <div className="py-2 px-3 text-xs text-yt-textSec">
          <p className="mb-2">About Press Copyright Contact us Creators Advertise Developers</p>
          <p>© 2024 YouClone LLC</p>
      </div>
    </aside>
  );
};

// 3. Category Pills
const CategoryPills = ({ categories, selected, onSelect }: { categories: Category[], selected: string, onSelect: (c: Category) => void }) => {
  return (
    <div className="sticky top-14 bg-yt-dark/95 backdrop-blur-sm z-30 w-full overflow-x-auto whitespace-nowrap py-3 px-4 hide-scrollbar flex gap-3 border-b border-yt-border/10">
        {categories.map(cat => (
            <button 
                key={cat}
                onClick={() => onSelect(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selected === cat 
                    ? 'bg-white text-black' 
                    : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
                }`}
            >
                {cat}
            </button>
        ))}
    </div>
  );
};

// 4. Video Card
const VideoCard: React.FC<{ video: Video; onClick: () => void }> = ({ video, onClick }) => {
  return (
    <div className="flex flex-col gap-2 cursor-pointer group" onClick={onClick}>
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-800">
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded font-medium">{video.duration}</span>
      </div>
      <div className="flex gap-3 mt-1 items-start">
        <img src={video.channelAvatarUrl} alt={video.channelName} className="w-9 h-9 rounded-full mt-0.5 flex-shrink-0" />
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-base line-clamp-2 leading-tight group-hover:text-white/90">{video.title}</h3>
          <p className="text-yt-textSec text-sm mt-1 hover:text-white transition-colors">{video.channelName}</p>
          <p className="text-yt-textSec text-sm">{video.views} views • {video.uploadedAt}</p>
        </div>
        <button className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-yt-hover rounded-full">
            <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

// 5. Watch Page
const WatchPage = ({ videoId, videoTitle, onClose }: { videoId: string, videoTitle: string, onClose: () => void }) => {
    const [details, setDetails] = useState<VideoDetail | null>(null);
    const [related, setRelated] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Video Generation State
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genError, setGenError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0,0);
        setLoading(true);
        setVideoUrl(null); // Reset video on change
        setGenError(null);
        // Parallel data fetching
        Promise.all([
            generateVideoDetails(videoId, videoTitle),
            generateVideos(`related to ${videoTitle}`)
        ]).then(([d, r]) => {
            setDetails(d);
            setRelated(r);
            setLoading(false);
        });
    }, [videoId, videoTitle]);

    const handlePlayClick = async () => {
        if (isGenerating || videoUrl) return;

        try {
            setIsGenerating(true);
            setGenError(null);

            // API Key Check
            const win = window as any;
            if (win.aistudio) {
                const hasKey = await win.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await win.aistudio.openSelectKey();
                }
            }

            const url = await generateRealVideo(videoTitle);
            if (url) {
                setVideoUrl(url);
            } else {
                setGenError("Video generation failed. Please try again.");
            }
        } catch (error: any) {
            console.error(error);
            // Robust error checking for JSON object errors or standard Error objects
            const errorMessage = error.message || JSON.stringify(error);
            
            if (errorMessage.includes("VEO_MODEL_NOT_FOUND") || errorMessage.includes("Requested entity was not found") || errorMessage.includes("404")) {
                if ((window as any).aistudio) {
                    await (window as any).aistudio.openSelectKey();
                    setGenError("Veo requires a PAID API Key. Please select a project with billing enabled.");
                } else {
                    setGenError("API Key invalid or model not found.");
                }
            } else {
                setGenError("Failed to generate video. Try checking your API key.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if(loading && !details) {
        return <div className="pt-20 pl-4 md:pl-24 text-white">Loading video studio...</div>;
    }

    return (
        <div className="pt-16 lg:pt-20 px-4 lg:px-10 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 text-white pb-20">
            {/* Main Column */}
            <div className="flex flex-col">
                {/* Player Area */}
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group bg-gray-900">
                     
                     {videoUrl ? (
                        <video 
                            src={videoUrl} 
                            controls 
                            autoPlay 
                            className="w-full h-full object-contain"
                        />
                     ) : (
                        // Placeholder / Generation UI
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-gray-900 to-black p-4 text-center">
                            {isGenerating ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Generating Video with Veo...</h3>
                                    <p className="text-gray-400 max-w-md">Creating "{videoTitle}". This usually takes 1-2 minutes. Please wait.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                    <button 
                                        onClick={handlePlayClick}
                                        className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center pl-2 mb-6 cursor-pointer hover:scale-110 hover:bg-red-600 transition-all shadow-xl group/btn"
                                    >
                                        <Play className="w-10 h-10 fill-white text-white" />
                                    </button>
                                    <h2 className="text-2xl font-bold mb-2">AI Generated Preview</h2>
                                    <p className="text-gray-400 mb-4 max-w-md">Click play to generate this video in real-time using Google's Veo model.</p>
                                    {genError && (
                                        <div className="flex items-center gap-2 text-red-400 bg-red-950/30 px-4 py-2 rounded-lg border border-red-900">
                                            <AlertCircle className="w-5 h-5" />
                                            <span>{genError}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                     )}

                </div>

                {/* Title & Actions */}
                <h1 className="text-xl font-bold mt-4 mb-2">{details?.title || videoTitle}</h1>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <img src={details?.channelAvatarUrl} className="w-10 h-10 rounded-full" alt="" />
                         <div>
                            <h3 className="font-bold text-base">{details?.channelName}</h3>
                            <p className="text-xs text-yt-textSec">{details?.subscribers} subscribers</p>
                         </div>
                         <button className="ml-4 bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-gray-200">Subscribe</button>
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        <div className="flex items-center bg-[#222] rounded-full">
                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-yt-hover rounded-l-full border-r border-[#333]">
                                <ThumbsUp className="w-5 h-5" />
                                <span className="text-sm font-medium">{details?.likes}</span>
                            </button>
                            <button className="px-4 py-2 hover:bg-yt-hover rounded-r-full">
                                <div className="rotate-180"><ThumbsUp className="w-5 h-5" /></div>
                            </button>
                        </div>
                        <button className="flex items-center gap-2 bg-[#222] px-4 py-2 rounded-full hover:bg-yt-hover">
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm font-medium">Share</span>
                        </button>
                        <button className="hidden md:flex items-center gap-2 bg-[#222] px-4 py-2 rounded-full hover:bg-yt-hover">
                            <Download className="w-5 h-5" />
                            <span className="text-sm font-medium">Download</span>
                        </button>
                        <button className="bg-[#222] p-2 rounded-full hover:bg-yt-hover">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Description Box */}
                <div className="mt-4 bg-[#222] rounded-xl p-3 text-sm hover:bg-[#2a2a2a] cursor-pointer transition-colors">
                    <div className="font-medium mb-1">{details?.views} views • {details?.uploadedAt}</div>
                    <div className="whitespace-pre-wrap text-yt-text">{details?.description}</div>
                </div>

                {/* Comments */}
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4">{details?.comments.length} Comments</h3>
                    <div className="space-y-4">
                        {details?.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
                                <div className="flex flex-col gap-1">
                                    <div className="text-xs font-bold flex gap-2 items-center">
                                        {comment.author} 
                                        <span className="text-yt-textSec font-normal">{comment.timeAgo}</span>
                                    </div>
                                    <p className="text-sm">{comment.content}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-xs text-yt-textSec">
                                            <ThumbsUp className="w-3.5 h-3.5" /> {comment.likes}
                                        </div>
                                        <div className="text-xs text-yt-textSec font-medium cursor-pointer hover:bg-[#333] px-2 py-1 rounded-full">Reply</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related Column */}
            <div className="flex flex-col gap-3">
                {related.map(video => (
                    <div key={video.id} onClick={() => { 
                         window.history.pushState(null, '', `#/watch/${video.id}`); 
                         // Force re-render hack via onClose -> Reopen mechanism handled by parent usually, 
                         // but effectively we just need to notify parent to change view.
                         // Here we assume standard router behavior but since I am building a manual router:
                         // I will dispatch a custom event or let the parent handle the URL change via hash listener.
                         // For this SPA simple implementation, I'll rely on the parent's hash listener.
                    }} className="flex gap-2 cursor-pointer group">
                         <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                             <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                             <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">{video.duration}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                             <h4 className="text-sm font-medium line-clamp-2 leading-tight group-hover:text-white/90">{video.title}</h4>
                             <p className="text-xs text-yt-textSec">{video.channelName}</p>
                             <p className="text-xs text-yt-textSec">{video.views} views • {video.uploadedAt}</p>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// 6. Home Grid
const HomeFeed = ({ videos, loading }: { videos: Video[], loading: boolean }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 px-4 py-4">
                {Array.from({length: 12}).map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-[#222] aspect-video rounded-xl mb-3"></div>
                        <div className="flex gap-3">
                            <div className="w-9 h-9 bg-[#222] rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-[#222] rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-[#222] rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8 px-4 py-4 pb-20">
            {videos.map(video => (
                <VideoCard 
                    key={video.id} 
                    video={video} 
                    onClick={() => { window.location.hash = `/watch/${video.id}?title=${encodeURIComponent(video.title)}`; }} 
                />
            ))}
        </div>
    );
};


// --- Main App ---

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<Category>('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Routing State
  const [route, setRoute] = useState<'home' | 'watch'>('home');
  const [watchId, setWatchId] = useState<string | null>(null);
  const [watchTitle, setWatchTitle] = useState<string>("");

  const categories: Category[] = ['All', 'Gaming', 'Music', 'Live', 'Programming', 'AI', 'News', 'Computers', 'Podcasts'];

  const fetchVideos = useCallback(async (q?: string) => {
    setLoading(true);
    const results = await generateVideos(q || "Trending videos mix of gaming tech and lifestyle");
    setVideos(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos(currentCategory === 'All' ? undefined : currentCategory);
  }, [currentCategory, fetchVideos]);

  // Hash Router implementation
  useEffect(() => {
      const handleHashChange = () => {
          const hash = window.location.hash;
          if (hash.startsWith('#/watch/')) {
              const id = hash.split('/')[2].split('?')[0];
              const params = new URLSearchParams(hash.split('?')[1]);
              setWatchId(id);
              setWatchTitle(params.get('title') || "Video");
              setRoute('watch');
              setSidebarOpen(false); // Auto close sidebar on watch
          } else {
              setRoute('home');
              setWatchId(null);
              // Only open sidebar if big screen on home
              if(window.innerWidth > 1024) setSidebarOpen(true);
          }
      };

      window.addEventListener('hashchange', handleHashChange);
      handleHashChange(); // Initial check

      return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSearch = (q: string) => {
      window.location.hash = '#/'; // Go home
      fetchVideos(q);
  };
  
  const handleOpenKeySettings = async () => {
      if ((window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
          // Ideally we would refresh content here, but since the content is dynamic, user can just navigate
      }
  };

  return (
    <div className="min-h-screen bg-yt-black text-white font-sans">
      <Header 
        onSearch={handleSearch} 
        onMenuClick={() => setSidebarOpen(prev => !prev)} 
        onLogoClick={() => window.location.hash = '#/'}
      />
      
      <Sidebar 
        isOpen={sidebarOpen && route === 'home'} 
        activeTab="home"
        onNavigate={(id) => console.log(id)} 
        onOpenKeySettings={handleOpenKeySettings}
      />

      <main className={`transition-all duration-300 ${
          route === 'home' 
            ? (sidebarOpen ? 'md:ml-60' : 'md:ml-[72px]') 
            : ''
      }`}>
        {route === 'home' && (
            <>
                <div className={`sticky top-14 z-20 bg-yt-black transition-all ${sidebarOpen ? '' : ''}`}>
                    <CategoryPills 
                        categories={categories} 
                        selected={currentCategory} 
                        onSelect={setCurrentCategory} 
                    />
                </div>
                <div className="mt-4">
                    <HomeFeed videos={videos} loading={loading} />
                </div>
            </>
        )}

        {route === 'watch' && watchId && (
            <WatchPage videoId={watchId} videoTitle={watchTitle} onClose={() => window.location.hash = '#/'} />
        )}
      </main>
    </div>
  );
}