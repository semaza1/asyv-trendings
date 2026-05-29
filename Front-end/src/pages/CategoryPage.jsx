import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import PostCard from "@/components/posts/PostCard";

const categoryTitles = {
  "trending-news": "Trending News",
  opportunities: "Opportunities",
  sports: "Sports Highlights",
  events: "Upcoming Events",
  visitors: "Upcoming Visitors",
  "did-you-know": "Did You Know?",
  projects: "Projects Showcase",
  gallery: "Photo & Video Gallery",
};

export default function CategoryPage() {
  const { category } = useParams();
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/${category}`)
      .then((res) => res.json())
      .then((data) => {
        setCategoryPosts(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Category Not Found
            </h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryTitle =
    categoryTitles[category] || category.replace("-", " ").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link to="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">
                {categoryTitle}
              </h1>
              <p className="text-muted-foreground mt-2">
                {categoryPosts.length}{" "}
                {categoryPosts.length === 1 ? "post" : "posts"} in this category
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="text-center py-12 text-lg text-muted-foreground">
              Loading...
            </div>
          ) : categoryPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No posts yet
              </h2>
              <p className="text-muted-foreground mb-4">
                There are no posts in the {categoryTitle.toLowerCase()} category
                yet.
              </p>
              <Link to="/">
                <Button variant="default">Explore Other Categories</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
