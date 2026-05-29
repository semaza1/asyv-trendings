import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Star,
  Calendar,
  ExternalLink,
  User,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export const ContentCard = ({ item, onEdit, onDelete }) => {
  const getCategoryColor = (category) => {
    const colors = {
      News: "bg-primary",
      Opportunities: "bg-secondary",
      Events: "bg-accent",
      Sports: "bg-success",
      Visitors: "bg-warning",
      "Did You Know?": "bg-muted",
      Projects: "bg-destructive",
    };
    return colors[category] || "bg-muted";
  };

  return (
    <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-muted-foreground text-white border-0 text-xs">
                {item.category}
              </Badge>

            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>

          {item.image && (
            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(item.publishDate, "MMM dd, yyyy")}
          </div>

          {item.deadline && (
            <div className="flex items-center gap-1 text-warning">
              <Clock className="w-3 h-3" />
              Deadline: {format(item.deadline, "MMM dd")}
            </div>
          )}

          {item.developerName && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {item.developerName}
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                className="text-xs px-2 py-1 bg-muted-foreground text-white"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge className="text-xs px-2 py-1 bg-muted-foreground text-white">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {item.applicationLink && (
            <a
              href={item.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                Apply
              </Button>
            </a>
          )}
          {item.projectLink && (
            <a
              href={item.projectLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                View Project
              </Button>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>

          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
