import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu, Settings, LogOut, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { logout, isStudent, isITAdmin, getUserField } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper to get initials from full name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Handle logout
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    logout(); // This will redirect to login page
  };

  // Handle settings navigation
  const handleSettings = () => {
    navigate("/admin/settings");
  };

  // Get user field display name
  const getFieldDisplayName = (field) => {
    const fieldMap = {
      news: "News",
      opportunities: "Opportunities",
      events: "Events",
      sports: "Sports",
      visitors: "Visitors",
      "did-you-know": "Did You Know",
      projects: "Projects",
    };
    return field ? fieldMap[field] || field : "";
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-40">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 h-9 w-9 hover:bg-accent hover:text-accent-foreground transition-colors"
              asChild
            >
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </SidebarTrigger>
            </Button>

            <div className="flex items-center justify-between w-full">
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {isITAdmin() ? "IT Items Management" : "Content Management"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isITAdmin()
                    ? "Manage IT equipment and devices"
                    : isStudent() && getUserField()
                      ? `Managing ${getFieldDisplayName(getUserField())} content`
                      : "Manage ASYV Trendings content"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-colors"
                    >
                      <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {getInitials(user?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 p-2"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2 p-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                              {getInitials(user?.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user?.fullName || "User"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.email || "user@example.com"}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Shield className="h-3 w-3 text-primary" />
                              <span className="text-xs font-medium text-primary capitalize">
                                {user?.role || "admin"}
                              </span>
                              {isStudent() && getUserField() && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  • {getFieldDisplayName(getUserField())}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSettings}
                      className="cursor-pointer flex items-center gap-2 p-3 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer flex items-center gap-2 p-3 rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
