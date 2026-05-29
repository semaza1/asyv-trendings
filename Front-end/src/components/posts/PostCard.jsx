import { Link } from "react-router-dom";
import { Calendar, Eye, User, ExternalLink, Github } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabels } from "@/data/mockData";
import { useState } from "react";

function normalizeType(type) {
  const t = (type || "").trim().toLowerCase();
  if (!t) return "news";
  switch (t) {
    case "trending-news":
      return "news";
    case "opportunities":
    case "opportunity":
      return "opportunity";
    case "sports":
      return "sports";
    case "events":
      return "event";
    case "visitors":
    case "visitor":
      return "visitor";
    case "did-you-know":
      return "didyouknow";
    case "projects":
    case "project":
      return "project";
    default:
      return t.replace(/-/g, "");
  }
}

export default function PostCard({ post, compact = false }) {
  const [isPortrait, setIsPortrait] = useState(null);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Modern card classes
  const cardClasses = `group flex flex-col h-[420px] sm:h-[440px] bg-white dark:bg-card rounded-2xl shadow-md border border-border overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1`;

  // Category label fallback
  const categoryLabel = post.category
    ? categoryLabels[post.category] || post.category
    : "News";

  return (
    <Card className={cardClasses}>
      {/* Image Area with fixed height */}
      <div className="relative w-full h-44 bg-gray-100 dark:bg-muted flex items-center justify-center overflow-hidden">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${isPortrait === null ? "object-cover" : isPortrait ? "object-contain" : "object-cover object-center"}`}
            onLoad={(e) => {
              const img = e.currentTarget;
              setIsPortrait(img.naturalHeight > img.naturalWidth);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
            No Image
          </div>
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        {/* Category Badge (always visible, from DB) */}
        <Badge
          className={`absolute top-3 left-3 bg-primary text-white border-0 shadow-md`}
        >
          {categoryLabel}
        </Badge>

      </div>
      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {post.postedAt ? formatDate(post.postedAt) : ""}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {post.author}
          </span>
        </div>
        {/* Title (ellipsis) */}
        <Link
          to={`/post/${normalizeType(post.category || "trending-news")}/${post._id}`}
        >
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
        </Link>
        {/* Developer/Location */}
        {post.category === "project" && post.developerName && (
          <div className="text-xs text-muted-foreground truncate">
            <span className="font-semibold">Developer:</span>{" "}
            {post.developerName}
          </div>
        )}
        {post.category === "events" && post.location && (
          <div className="text-xs text-muted-foreground truncate">
            <span className="font-semibold">Location:</span> {post.location}
          </div>
        )}
        {/* Description (ellipsis) */}
        <p className="text-muted-foreground text-sm line-clamp-3 mb-1 flex-1">
          {post.description}
        </p>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0.5 text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {/* Deadline for Opportunities */}
        {post.category === "opportunities" && post.deadline && (
          <div className="mb-1 p-2 bg-muted rounded-md text-xs">
            <span className="font-semibold">Deadline:</span>{" "}
            {new Date(post.deadline).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}
        {/* Project Link for Projects */}
        {post.category === "project" && post.projectLink && (
          <div className="mb-1 p-2 bg-muted rounded-md text-xs">
            <a
              href={post.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              View Project
            </a>
          </div>
        )}
        {/* Action Buttons (footer) */}
        <div className="mt-auto flex items-center justify-between pt-2 gap-2">
          <Link
            to={`/post/${normalizeType(post.category || "trending-news")}/${post._id}`}
          >
            <Button variant="outline" size="sm">
              Read More
            </Button>
          </Link>
          {/* Opportunity Apply Button */}
          {post.category === "opportunities" && post.applicationLink && (
            <Button
              variant="default"
              size="sm"
              asChild
              disabled={
                post.deadline ? new Date() > new Date(post.deadline) : false
              }
            >
              <a
                href={post.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply Now
              </a>
            </Button>
          )}
          {/* Project Links */}
          {post.category === "projects" && (
            <div className="flex space-x-2">
              {post.githubUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={post.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {post.demoUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={post.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
