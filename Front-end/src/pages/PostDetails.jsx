import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  ExternalLink,
  Github,
  Link as LinkIcon,
  FileText,
  MapPin,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";

// Map route type to backend endpoint
const endpointMap = {
  news: "trending-news",
  event: "events",
  sports: "sports",
  visitor: "visitors",
  didyouknow: "did-you-know",
  project: "projects",
  opportunity: "opportunities",
};

export default function PostDetails() {
  const { type, id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type || !id) return;
    setLoading(true);
    setError(null);
    // Normalize type to match endpointMap keys
    const endpointKey = type.replace(/-/g, "").toLowerCase();
    const endpoint = endpointMap[endpointKey];
    if (!endpoint) {
      setError("Invalid post type");
      setLoading(false);
      return;
    }
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_BASE_URL}/api/${endpoint}/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        if (data.success && data.data) {
          setPost(data.data);
        } else {
          setPost(null);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch post");
        setPost(null);
      })
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-lg font-medium text-muted-foreground">Loading story...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-foreground">Post Not Found</h1>
            <p className="text-muted-foreground">The content you are looking for does not exist or has been removed.</p>
            <Link to="/">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Map display category to category route segment
  const categoryRouteMap = {
    news: "trending-news",
    event: "events",
    sports: "sports",
    visitor: "visitors",
    didyouknow: "did-you-know",
    project: "projects",
    opportunity: "opportunities",
  };
  const normalizedCategoryKey = (post.category || "").replace(/-/g, "").toLowerCase();
  const categoryRoute = categoryRouteMap[normalizedCategoryKey] || post.category || "";
  const displayCategory = post.category?.replace("-", " ").toUpperCase();
  const postImage = post.image || post.imageUrl;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Immersive Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[400px] flex flex-col justify-end">
        {/* Background Image & Overlay */}
        {postImage ? (
          <>
            <div className="absolute inset-0">
              <img src={postImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
        )}

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pb-24 md:pb-32">
          <Link to="/">
            <Button variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          
          <div className="max-w-4xl mx-auto space-y-4 animate-fade-in-up">
            <Badge className="bg-primary text-white border-none shadow-lg px-3 py-1 text-xs md:text-sm tracking-wider font-semibold">
              {displayCategory}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-md">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-white/90 font-medium pt-4">
              {post.author && (
                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <User className="h-4 w-4" />
                  {post.author}
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedDate || post.postedAt || Date.now()).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                <Eye className="h-4 w-4" />
                {post.views ?? 0} Views
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 -mt-16 md:-mt-24 relative z-20 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-6 md:p-12 lg:p-16 space-y-12">
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-6 border-b border-border/50">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 bg-muted/50 text-foreground/80 hover:bg-muted transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Rich Content Blocks */}
              <article className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                {Array.isArray(post.content) && post.content.map((block, idx) => {
                  if (block.type === "paragraph") {
                    return (
                      <p key={idx} className="leading-relaxed text-[17px] md:text-[19px] text-foreground/90 whitespace-pre-wrap font-medium tracking-normal">
                        {block.text}
                      </p>
                    );
                  }
                  
                  if (block.type === "image") {
                    return (
                      <figure key={idx} className="my-10 space-y-3">
                        <div className="overflow-hidden rounded-2xl bg-muted ring-1 ring-border shadow-md">
                          <img
                            src={block.url}
                            alt={block.alt || block.caption || post.title}
                            className="w-full h-auto max-h-[70vh] object-contain hover:scale-[1.02] transition-transform duration-500 ease-out"
                          />
                        </div>
                        {block.caption && (
                          <figcaption className="text-center text-sm md:text-base text-muted-foreground italic px-4">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  
                  if (block.type === "pdf") {
                    return (
                      <div key={idx} className="my-10 bg-muted/30 p-2 md:p-4 rounded-2xl border shadow-sm">
                        <div className="flex items-center justify-between mb-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                              <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-foreground m-0">{block.title || "Attached Document"}</h3>
                          </div>
                          <a href={block.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                            <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                              <ExternalLink className="h-4 w-4" /> Open Fullscreen
                            </Button>
                          </a>
                        </div>
                        <div className="rounded-xl overflow-hidden border shadow-inner bg-card">
                          <iframe
                            src={`${block.url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-[60vh] min-h-[400px] border-0"
                            title={`PDF: ${block.title || "Document"}`}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (block.type === "link") {
                    return (
                      <div key={idx} className="my-8">
                        <a 
                          href={block.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group block no-underline"
                        >
                          <div className="flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <LinkIcon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground m-0 group-hover:text-primary transition-colors">
                                  {block.text || block.url}
                                </h3>
                                <span className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-md block mt-1">
                                  {block.url}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-4 flex-shrink-0" />
                          </div>
                        </a>
                      </div>
                    );
                  }

                  return null;
                })}
              </article>

              {/* Category Specific Callouts */}
              {post.category === "project" && (
                <div className="mt-12 p-8 bg-gradient-to-br from-muted to-muted/50 rounded-3xl border shadow-inner">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Github className="h-6 w-6 text-primary" /> Project Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Developer(s)</span>
                      <p className="text-lg font-semibold text-foreground">{post.developerName}</p>
                    </div>
                    {post.projectLink && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Repository / Link</span>
                        <a href={post.projectLink} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-primary hover:underline flex items-center gap-1">
                          View Project <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional Project Resources */}
                  {(post.githubUrl || post.demoUrl) && (
                    <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-border/50">
                      {post.githubUrl && (
                        <a href={post.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Button className="gap-2 bg-[#24292e] text-white hover:bg-[#24292e]/90"><Github className="h-4 w-4"/> Source Code</Button>
                        </a>
                      )}
                      {post.demoUrl && (
                        <a href={post.demoUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="default" className="gap-2"><ExternalLink className="h-4 w-4"/> Live Demo</Button>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {post.category === "event" && (post.location || post.link) && (
                <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl border border-primary/10 shadow-inner">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
                    <Calendar className="h-6 w-6" /> Event Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {post.location && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Location</span>
                        <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" /> {post.location}
                        </p>
                      </div>
                    )}
                    {post.link && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Event Link</span>
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-primary hover:underline flex items-center gap-1">
                          Join / RSVP <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {post.category === "opportunities" && (
                <div className="mt-12 p-8 bg-gradient-to-br from-orange-500/10 to-transparent dark:from-orange-500/5 rounded-3xl border border-orange-500/20 shadow-inner">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <Clock className="h-6 w-6" /> Opportunity Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Deadline</span>
                      <p className="text-lg font-semibold text-foreground">
                        {post.deadline ? new Date(post.deadline).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                      </p>
                    </div>
                    {post.applicationLink && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Application</span>
                        <a href={post.applicationLink} target="_blank" rel="noopener noreferrer">
                          <Button className="mt-1 gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all">
                            Apply Now <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="max-w-4xl mx-auto mt-12 text-center space-y-6">
            <div className="inline-block p-1 bg-muted rounded-full">
              <div className="flex items-center gap-2">
                <Link to={`/category/${categoryRoute}`}>
                  <Button variant="ghost" className="rounded-full px-6 font-medium hover:bg-background shadow-sm">
                    Read more {displayCategory}
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="default" className="rounded-full px-6 font-medium bg-foreground text-background hover:bg-foreground/90 shadow-md">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
