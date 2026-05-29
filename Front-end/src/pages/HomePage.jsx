import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
// import HeroSection from "@/components/layout/HeroSection";
import CategorySection from "@/components/posts/CategorySection";
import PostCard from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { getRecentPosts } from '@/data/mockData';
import logo from "@/assets/asyv.png";

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${apiUrl}/api/posts?limit=6`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        // Map backend fields to PostCard expected props
        const posts = data.data.map((post) => ({
          _id: post._id,
          title: post.title,
          description: post.description,
          image: post.image || post.imageUrl, // fallback for any field
          tags: post.tags,
          postedAt: post.publishedDate || post.postedAt,
          category:
            post.type?.toLowerCase().replace(/ /g, "-") || post.category,
          author: post.author || "ASYV",
          views: post.views || 0,
          deadline: post.deadline,
          applicationUrl: post.applicationUrl,
          githubUrl: post.githubUrl,
          demoUrl: post.demoUrl,
        }));
        setRecentPosts(posts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {/* <HeroSection /> */}

        {/* Recent Posts Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center">
                <Sparkles className="h-8 w-8 mr-3 text-primary" />
                Latest Updates
              </h2>
              <p className="text-muted-foreground">
                Stay up to date with the most recent campus news and activities
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              {loading ? "..." : `${recentPosts.length} New Posts`}
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              Loading...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {recentPosts.map((post, index) => (
                <div
                  key={post._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/all-posts">
              <Button variant="outline" size="lg" className="group">
                View All Posts
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Category Exploration */}
        <CategorySection />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-tr from-[rgb(73,129,96)] via-[rgb(91,108,75)] to-[rgb(109,87,54)] text-primary-foreground mt-16 shadow-lg rounded-t-3xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10">
            <div className="flex flex-col items-center md:items-start md:w-1/3 mb-8 md:mb-0">
              <img
                src={logo}
                alt="ASYV Logo"
                className="h-16 w-16 object-contain mb-4"
              />
              <h3 className="text-2xl font-extrabold tracking-tight mb-2">
                ASYV Trendings
              </h3>
              <p className="text-primary-foreground/80 text-base mb-4 text-center md:text-left">
                Connecting the ASYV community through news, opportunities, and
                shared experiences.
              </p>
              <div className="flex space-x-4 mt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener"
                  aria-label="Facebook"
                  className="hover:text-blue-500 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.104C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"></path>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener"
                  aria-label="Twitter"
                  className="hover:text-sky-400 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.555-2.005.959-3.127 1.184A4.916 4.916 0 0016.616 3c-2.717 0-4.92 2.206-4.92 4.917 0 .386.044.762.127 1.124C7.728 8.82 4.1 6.884 1.671 3.149c-.423.724-.666 1.562-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636z"></path>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  className="hover:text-pink-500 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.809.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.277-.353-2.45-1.32-3.417-.967-.967-2.14-1.261-3.417-1.32C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex flex-col md:w-1/3 mb-8 md:mb-0">
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>
                  <Link
                    to="/category/trending-news"
                    className="hover:text-primary transition-colors"
                  >
                    News
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/opportunities"
                    className="hover:text-primary transition-colors"
                  >
                    Opportunities
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/events"
                    className="hover:text-primary transition-colors"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/sports"
                    className="hover:text-primary transition-colors"
                  >
                    Sports
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col md:w-1/3">
              <h4 className="font-semibold mb-4 text-lg">About</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-primary transition-colors"
                  >
                    About ASYV
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="hover:text-primary transition-colors"
                  >
                    Admin Panel
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-10 pt-8 text-center text-primary-foreground/80">
            <p className="text-base">
              &copy; {new Date().getFullYear()} ASYV Trendings. Built with{" "}
              <span className="text-pink-500">&#10084;&#65039;</span> for the
              ASYV community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
