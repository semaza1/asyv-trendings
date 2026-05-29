import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/Header";
import PostCard from "@/components/posts/PostCard";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [posts, setPosts] = useState([]);

  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    setError(null);

    const categories = [
      "trending-news",
      "opportunities",
      "sports",
      "events",
      "visitors",
      "did-you-know",
      "projects",
    ];

    const fetchCategory = async (category) => {
      try {
        const res = await fetch(`${apiUrl}/api/${category}`);
        const json = await res.json();
        const items = json?.data || [];
        return items.map((post) => ({
          _id: post._id || post.id || "",
          title: post.title,
          description: post.description,
          image: post.image,
          postedAt: post.postedAt || post.publishDate || post.createdAt,
          views: post.views,
          author: post.author,
          tags: post.tags,
          category: post.category || category,
          deadline: post.deadline,
          applicationLink: post.applicationLink,
          developerName: post.developerName,
          projectLink: post.projectLink,
          githubUrl: post.githubUrl,
          demoUrl: post.demoUrl,
          location: post.location,
        }));
      } catch {
        return [];
      }
    };

    Promise.all(categories.map(fetchCategory))
      .then((results) => {
        const merged = results.flat();
        // Deduplicate by _id + category in case IDs overlap across collections
        const dedupMap = new Map();
        for (const p of merged) {
          const key = `${p._id}::${p.category || ""}`;
          if (p._id && !dedupMap.has(key)) dedupMap.set(key, p);
        }
        setPosts(Array.from(dedupMap.values()));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch posts");
        setLoading(false);
      });
  }, [apiUrl]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredPosts(
      posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          (post.author && post.author.toLowerCase().includes(query)) ||
          (post.tags &&
            post.tags.some((tag) => tag.toLowerCase().includes(query))),
      ),
    );
  }, [searchQuery, posts]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Search Results
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchQuery && (
              <p className="text-muted-foreground mt-4">
                {filteredPosts.length}{" "}
                {filteredPosts.length === 1 ? "result" : "results"} for "
                {searchQuery}"
              </p>
            )}
          </div>

          {/* Results */}
          {searchQuery ? (
            filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No results found
                </h2>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or browse all posts
                </p>
                <Link to="/">
                  <Button variant="default">Browse All Posts</Button>
                </Link>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Start Searching
              </h2>
              <p className="text-muted-foreground">
                Enter a search term above to find posts, categories, or authors
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
