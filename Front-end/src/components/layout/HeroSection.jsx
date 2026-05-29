import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Removed: import { getFeaturedPosts, Post } from '@/data/mockData';
import { Link } from "react-router-dom";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentOpportunity, setCurrentOpportunity] = useState(0);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_BASE_URL}/api/trending-news?limit=3`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/events?limit=3`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/sports?limit=3`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/visitors?limit=3`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/did-you-know?limit=3`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/projects?limit=3`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/opportunities?limit=3`).then((res) => res.json()),
    ])
      .then(
        ([
          newsRes,
          eventsRes,
          sportsRes,
          visitorsRes,
          didYouKnowRes,
          projectsRes,
          oppRes,
        ]) => {

          const items = [];
          if (newsRes.success && Array.isArray(newsRes.data)) {
            items.push(
              ...newsRes.data.map((item) => ({
                _id: item._id,
                title: item.title,
                description: item.description,
                image: item.image,
                type: "News",
                publishedDate: item.publishedDate,
                postedAt: item.postedAt,
                views: item.views,
              })),
            );
          }
          if (eventsRes.success && Array.isArray(eventsRes.data)) {
            items.push(
              ...eventsRes.data.map((item) => ({
                _id: item._id,
                title: item.title,
                description: item.description,
                image: item.image,
                type: "Event",
                publishedDate: item.publishedDate,
                postedAt: item.postedAt,
                views: item.views,
              })),
            );
          }
          if (sportsRes.success && Array.isArray(sportsRes.data)) {
            items.push(
              ...sportsRes.data.map((item) => ({
                _id: item._id,
                title: item.title,
                description: item.description,
                image: item.image,
                type: "Sports",
                publishedDate: item.publishedDate,
                postedAt: item.postedAt,
                views: item.views,
              })),
            );
          }
          if (visitorsRes.success && Array.isArray(visitorsRes.data)) {
            items.push(
              ...visitorsRes.data.map((item) => ({
                _id: item._id,
                title: item.title || item.name || "Visitor",
                description: item.description || "",
                image: item.image,
                type: "Visitor",
                publishedDate: item.publishedDate,
                postedAt: item.postedAt,
                views: item.views,
              })),
            );
          }
          if (didYouKnowRes.success && Array.isArray(didYouKnowRes.data)) {
            items.push(
              ...didYouKnowRes.data.map((item) => ({
                _id: item._id,
                title: item.title || "Did You Know",
                description: item.description,
                image: item.image,
                type: "DidYouKnow",
                publishedDate: item.publishedDate,
                postedAt: item.postedAt,
                views: item.views,
              })),
            );
          }
          if (projectsRes.success && Array.isArray(projectsRes.data)) {
            items.push(
              ...projectsRes.data.map((item) => ({
                _id: item._id,
                title: item.title || "Project",
                description: item.description,
                image: item.image,
                type: "Project",
                publishedDate: item.publishedDate,
                postedAt: item.postedAt,
                views: item.views,
              })),
            );
          }
          // Sort by publishedDate or postedAt descending (most recent first)
          items.sort((a, b) => {
            const dateA = new Date(
              a.publishedDate || a.postedAt || 0,
            ).getTime();
            const dateB = new Date(
              b.publishedDate || b.postedAt || 0,
            ).getTime();
            return dateB - dateA;
          });
          setFeaturedItems(items);
          if (oppRes.success) setOpportunities(oppRes.data);
          else setError("Failed to load opportunities");
          setLoading(false);
        },
      )
      .catch(() => {
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (featuredItems.length === 0 || opportunities.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
      setCurrentOpportunity((prev) => (prev + 1) % opportunities.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredItems.length, opportunities.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredItems.length) % featuredItems.length,
    );
  };

  if (loading) {
    return (
      <section className="w-full h-64 flex items-center justify-center">
        <span className="text-lg text-muted-foreground">Loading...</span>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full h-64 flex items-center justify-center">
        <span className="text-lg text-red-500">{error}</span>
      </section>
    );
  }

  // Modern, appealing message component
  const NoDataMessage = ({ message }) => (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-inner animate-fade-in">
      <svg
        className="w-16 h-16 mb-4 text-primary/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-xl font-semibold text-gray-700 mb-2">
        No Data Available
      </span>
      <span className="text-base text-gray-500">{message}</span>
    </div>
  );

  // If no featured items at all, show message for the whole section
  if (featuredItems.length === 0 && opportunities.length === 0) {
    return (
      <section className="w-full h-64 flex items-center justify-center">
        <NoDataMessage message="No data is being fetched for items or opportunities." />
      </section>
    );
  }

  // If only featured items are missing, show message for carousel, and vice versa for opportunities
  const showCarousel = featuredItems.length > 0;
  const showOpportunities = opportunities.length > 0;

  const currentPost = featuredItems[currentSlide];
  const currentOpp = opportunities[currentOpportunity];
  const nextPost = featuredItems[(currentSlide + 1) % featuredItems.length];
  const nextOpp =
    opportunities[(currentOpportunity + 1) % opportunities.length];

  return (
    <section
      className={`relative w-full h-[600px] sm:h-[650px] md:h-[400px] lg:h-[500px] grid gap-4 mb-8 ${showCarousel && showOpportunities ? "md:grid-cols-8" : "md:grid-cols-8"} grid-cols-1`}
    >
      {/* Featured Carousel Section */}
      <div
        className={`relative w-full h-full overflow-hidden rounded-xl shadow-hero ${showCarousel && showOpportunities ? "col-span-1 md:col-span-5" : "col-span-1 md:col-span-8"}`}
      >
        {showCarousel ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
              style={{ backgroundImage: `url(${currentPost.image})` }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-hero opacity-20" />

            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 mr-2" />
                {currentPost.type}
              </Badge>
            </div>

            <div className="relative h-full flex items-end">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                <div className="max-w-2xl">
                  {/* Mobile: Simple title overlay */}
                  <div className="block md:hidden">
                    <h2 className="text-xl font-bold text-white mb-4 line-clamp-3 drop-shadow-2xl leading-tight">
                      {currentPost.title}
                    </h2>
                    <Link
                      to={`/post/${currentPost.type.toLowerCase().replace(/-/g, "")}/${currentPost._id}`}
                    >
                      <Button
                        variant="default"
                        className="bg-primary/90 hover:bg-primary backdrop-blur-sm"
                      >
                        Read More
                      </Button>
                    </Link>
                  </div>

                  {/* Desktop: Full card with details */}
                  <Card className="hidden md:block bg-black/15 backdrop-blur-sm border-white/10 shadow-xl mb-6 animate-scale-in">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-white/90 mb-3 line-clamp-2 drop-shadow-lg">
                        {currentPost.title}
                      </h2>
                      <p className="text-white/70 mb-4 line-clamp-2 drop-shadow-md">
                        {currentPost.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(
                              currentPost.publishedDate ||
                              currentPost.postedAt ||
                              "",
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <Link
                          to={`/post/${currentPost.type.toLowerCase().replace(/-/g, "")}/${currentPost._id}`}
                        >
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-primary/80 hover:bg-primary backdrop-blur-sm"
                          >
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {featuredItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {featuredItems.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {featuredItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                        ? "bg-white scale-110"
                        : "bg-white/50 hover:bg-white/75"
                      }`}
                  />
                ))}
              </div>
            )}

            <div className="hidden md:flex absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-md items-center space-x-2">
              <img
                src={nextPost.image}
                alt="Next Post"
                className="w-10 h-10 object-cover rounded-md"
              />

              <div>
                <p className="text-sm">Up Next:</p>
                <p className="text-md font-semibold line-clamp-1">
                  {nextPost.title}
                </p>
              </div>
            </div>
          </>
        ) : (
          <NoDataMessage message="No news, events, sports, visitors, did you know, or projects are available." />
        )}
      </div>

      {/* Opportunities Section */}
      {showOpportunities ? (
        <div className="col-span-1 md:col-span-3 relative w-full h-full overflow-hidden rounded-xl shadow-hero">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
            style={{ backgroundImage: `url(${currentOpp.image})` }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-hero opacity-20" />

          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 mr-2" />
              {currentOpp.category || "Opportunity"}
            </Badge>
          </div>

          <div className="relative h-full flex items-end">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6">
              <div className="max-w-2xl">
                {/* Mobile: Simple title with deadline and apply button */}
                <div className="block md:hidden">
                  <h2 className="text-xl font-bold text-white mb-4 line-clamp-3 drop-shadow-2xl leading-tight">
                    {currentOpp.title}
                  </h2>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center text-sm text-white/90 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      {new Date(currentOpp.deadline).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "2-digit" },
                      )}
                    </div>
                    <Link
                      to={
                        currentOpp.applicationLink || "https://www.google.com/"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="default"
                        className="bg-primary/90 hover:bg-primary backdrop-blur-sm"
                      >
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Desktop: Full details */}
                <div className="hidden md:block">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90 mb-4 animate-slide-up drop-shadow-lg">
                    {currentOpp.title}
                  </h2>

                  <p className="text-lg md:text-xl text-white/70 mb-6 animate-fade-in drop-shadow-md">
                    Deadline:{" "}
                    {(() => {
                      const date = new Date(currentOpp.deadline);
                      return `${date.toLocaleDateString(undefined, { month: "long" })} ${date.getDate()}, ${date.getFullYear()}`;
                    })()}
                  </p>

                  <Card className="bg-black/15 backdrop-blur-sm border-white/10 shadow-xl mb-6 animate-scale-in">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Deadline:{" "}
                            {(() => {
                              const date = new Date(currentOpp.deadline);
                              return `${date.toLocaleDateString(undefined, { month: "long" })} ${date.getDate()}, ${date.getFullYear()}`;
                            })()}
                          </div>
                        </div>
                        <Link
                          to={
                            currentOpp.applicationLink ||
                            "https://www.google.com/"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-primary/80 hover:bg-primary backdrop-blur-sm"
                          >
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-md items-center space-x-2">
            <img
              src={nextOpp.image}
              alt="Next Opportunity"
              className="w-10 h-10 object-cover rounded-md"
            />

            <div>
              <p className="text-sm">Up Next:</p>
              <p className="text-md font-semibold line-clamp-1">
                {nextOpp.title}
              </p>
            </div>
          </div>
        </div>
      ) : (
        showCarousel && (
          <div className="col-span-1 md:col-span-3 flex items-center justify-center">
            <NoDataMessage message="No opportunities are available at the moment." />
          </div>
        )
      )}
    </section>
  );
}
