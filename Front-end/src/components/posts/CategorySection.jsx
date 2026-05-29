import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Grid, List, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { categoryLabels, categoryColors } from "@/data/mockData";

const categories = [
  "trending-news",
  "opportunities",
  "sports",
  "events",
  "visitors",
  "did-you-know",
  "project",
];

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function CategorySection() {
  const [viewMode, setViewMode] = useState("grid");
  const [postsByCategory, setPostsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      categories.map((category) =>
        fetch(
          `${API_BASE_URL}/api/${category === "project" ? "projects" : category}`,
        )
          .then((res) => res.json())
          .then((data) => ({
            category,
            posts: (data.data || []).map((post) => {
              // Map backend fields to Post type
              if (category === "project") {
                return {
                  ...post,
                  developerName: post.developerName,
                  projectLink: post.projectLink,
                  githubUrl: post.githubUrl,
                  demoUrl: post.demoUrl,
                  postedAt: post.publishedDate,
                };
              } else if (category === "events") {
                return {
                  ...post,
                  location: post.location,
                  postedAt: post.publishedDate,
                };
              } else if (category === "opportunities") {
                return {
                  ...post,
                  deadline: post.deadline,
                  applicationLink: post.applicationLink,
                  postedAt: post.publishedDate,
                };
              } else {
                return {
                  ...post,
                  postedAt: post.publishedDate,
                };
              }
            }),
          }))
          .catch(() => ({ category, posts: [] })),
      ),
    ).then((results) => {
      const map = {};
      results.forEach(({ category, posts }) => {
        map[category] = posts;
      });
      setPostsByCategory(map);
      setLoading(false);
    });
  }, []);

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/10 p-8 mb-12">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Explore by Category
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Discover the latest updates across all areas of campus life
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1.5 flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0 rounded-xl"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0 rounded-xl"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-primary/20 shadow-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>
      <Tabs defaultValue="trending-news" className="w-full">
        <TabsList className="flex w-full gap-2 overflow-x-auto pb-4 mb-8 bg-transparent">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="min-w-[120px] rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 px-4 py-2.5 
                text-sm font-medium shadow-sm transition-all duration-300
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                data-[state=active]:shadow-lg data-[state=active]:scale-105
                hover:bg-background/80"
            >
              {categoryLabels[category].split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((category) => {
          const posts = postsByCategory[category] || [];
          const displayPosts = posts.slice(0, viewMode === "grid" ? 6 : 4);
          return (
            <TabsContent key={category} value={category} className="space-y-8">
              {/* Modern Category Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(73,129,96)]/10 via-[rgb(91,108,75)]/5 to-transparent border border-primary/20 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-grid-white/5" />
                <div className="relative p-8">
                  <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-6">
                    <div className="flex-1">
                      <div className="flex items-start md:items-center gap-6 flex-wrap md:flex-nowrap">
                        <div
                          className={`w-16 h-16 rounded-2xl ${categoryColors[category]} flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}
                        >
                          <span className="text-2xl font-bold text-white">
                            {posts.length}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                            {categoryLabels[category]}
                          </h3>
                          <p className="text-muted-foreground text-base font-medium max-w-2xl">
                            {getCategoryDescription(category)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center backdrop-blur-sm border border-primary/10 shadow-xl">
                        <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                          <span className="text-3xl filter drop-shadow-md">
                            📊
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Posts Grid/List */}
              {loading ? (
                <div className="text-center py-12 text-lg text-muted-foreground">
                  Loading...
                </div>
              ) : posts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-6"
                    }
                  >
                    {displayPosts.map((post, index) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={
                          viewMode === "grid"
                            ? "h-full transform hover:scale-102 transition-transform duration-300"
                            : ""
                        }
                      >
                        <PostCard post={post} compact={viewMode === "list"} />
                      </motion.div>
                    ))}
                  </div>
                  {posts.length > displayPosts.length && (
                    <motion.div
                      className="text-center pt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <Link to={`/category/${category}`}>
                        <Button
                          variant="outline"
                          className="group bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:border-primary/30 
                            transition-all duration-300 hover:scale-105 rounded-xl px-6 py-5 h-auto"
                        >
                          View All {categoryLabels[category]}
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 border border-muted backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-grid-white/5" />
                  <div className="relative text-center py-20 px-8">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center"
                      whileHover={{ rotate: 10, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-3xl opacity-50">📝</span>
                    </motion.div>
                    <h4 className="text-xl font-semibold text-foreground mb-3">
                      No posts in this category yet
                    </h4>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Check back soon for exciting updates and new content in
                      this category!
                    </p>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}

function getCategoryDescription(category) {
  const descriptions = {
    "trending-news": "Latest news and updates from around campus",
    opportunities: "Scholarships, programs, and career opportunities",
    sports: "Athletic achievements and upcoming games",
    events: "Campus events, celebrations, and activities",
    visitors: "Notable guests and speakers visiting campus",
    "did-you-know": "Interesting facts and inspiring stories",
    projects: "Student-built projects and innovations",
    gallery: "Photo and video collections from campus life",
  };
  return descriptions[category] || "";
}
