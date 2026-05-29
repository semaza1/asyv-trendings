import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  Menu,
  User,
  Home,
  Calendar,
  Trophy,
  BookOpen,
  Lightbulb,
  Camera,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/asyv.png";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "News", href: "/category/trending-news", icon: BookOpen },
  { name: "Opportunities", href: "/category/opportunities", icon: Briefcase },
  { name: "Sports", href: "/category/sports", icon: Trophy },
  { name: "Events", href: "/category/events", icon: Calendar },
  { name: "Projects", href: "/category/projects", icon: BookOpen },
  { name: "Did You Know?", href: "/category/did-you-know", icon: Lightbulb },
  { name: "Gallery", href: "/category/gallery", icon: Camera },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileMenuOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const endpoints = {
        "News": "/api/trending-news?limit=1",
        "Opportunities": "/api/opportunities?limit=1",
        "Sports": "/api/sports?limit=1",
        "Events": "/api/events?limit=1",
        "Projects": "/api/projects?limit=1",
      };

      try {
        const promises = Object.entries(endpoints).map(async ([name, url]) => {
          const res = await fetch(`${API_BASE_URL}${url}`);
          const data = await res.json();
          return { name, count: data.total || 0 };
        });

        const results = await Promise.all(promises);
        const newCounts = {};
        results.forEach(r => newCounts[r.name] = r.count);
        setCounts(newCounts);
      } catch (err) {
        console.error("Failed to fetch counts", err);
      }
    };
    fetchCounts();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div>
              <img
                src={logo}
                alt="ASYV Logo"
                className="h-12 w-12 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">
                ASYV Trendings
              </h1>
              <p className="text-xs text-muted-foreground">
                The School Media house
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navigation.slice(0, 5).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {counts[item.name] !== undefined && counts[item.name] > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                    {counts[item.name]}
                  </span>
                )}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <span>More</span>
                <ChevronDown className="h-4 w-4 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-card border rounded-md shadow-lg py-1 flex flex-col">
                  <Link
                    to="/category/projects"
                    className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="flex-1">Projects</span>
                    {counts["Projects"] !== undefined && counts["Projects"] > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                        {counts["Projects"]}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/admin/it-items"
                    className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>Inventory</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Login Button */}
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative md:hidden">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search posts..."
                      className="pl-10 pr-4"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="flex-1">{item.name}</span>
                        {counts[item.name] !== undefined && counts[item.name] > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                            {counts[item.name]}
                          </span>
                        )}
                      </Link>
                    ))}
                    <Link
                      to="/admin/it-items"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Briefcase className="h-5 w-5" />
                      <span className="flex-1">Inventory</span>
                    </Link>
                  </nav>

                  <div className="pt-4 border-t">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
