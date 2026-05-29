import {
  LayoutDashboard,
  Newspaper,
  Users,
  Calendar,
  Trophy,
  Lightbulb,
  Code2,
  Settings,
  LogOut,
  UserCog,
  Monitor,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/asyv.png";
import { createLogoutHandler } from "@/utils/logout";
import { canAccessAdminSection } from "@/utils/auth";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    section: "dashboard",
  },
  {
    title: "News",
    url: "/admin/news",
    icon: Newspaper,
    section: "news",
  },
  {
    title: "Opportunities",
    url: "/admin/opportunities",
    icon: Users,
    section: "opportunities",
  },
  {
    title: "Events",
    url: "/admin/events",
    icon: Calendar,
    section: "events",
  },
  {
    title: "Sports",
    url: "/admin/sports",
    icon: Trophy,
    section: "sports",
  },
  {
    title: "Visitors",
    url: "/admin/visitors",
    icon: Users,
    section: "visitors",
  },
  {
    title: "Did You Know?",
    url: "/admin/did-you-know",
    icon: Lightbulb,
    section: "did-you-know",
  },
  {
    title: "Student Projects",
    url: "/admin/projects",
    icon: Code2,
    section: "projects",
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: UserCog,
    section: "users",
  },
  {
    title: "ASYV Items",
    url: "/admin/it-items",
    icon: Monitor,
    section: "it-items",
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    section: "settings",
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (url) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  // Filter menu items based on user access
  const accessibleMenuItems = menuItems.filter((item) =>
    canAccessAdminSection(item.section),
  );

  // Create logout handler using the utility
  const handleLogout = createLogoutHandler(navigate, setIsLoggingOut, {
    showConfirmation: false, // No confirmation dialog
    callBackendLogout: true, // Set to false if you don't have backend logout
    redirectTo: "/",
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt="ASYV Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          {open && (
            <div className="ml-3">
              <h2 className="font-bold text-sidebar-foreground">
                ASYV Trendings
              </h2>
              <p className="text-xs text-sidebar-foreground/70">Admin Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel>Content Management</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {accessibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={!open ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      className={({ isActive: linkActive }) =>
                        `flex items-center gap-3 rounded-lg transition-all duration-200 ${
                          isActive(item.url) || linkActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        } ${!open ? "justify-center px-0 py-3" : "px-3 py-2"}`
                      }
                    >
                      <item.icon
                        className={`${!open ? "h-6 w-6" : "h-4 w-4"} shrink-0`}
                      />
                      {open && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`${!open ? "p-2" : "p-4"}`}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={
                !open ? (isLoggingOut ? "Logging out..." : "Logout") : undefined
              }
              className={`text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer transition-all duration-200 flex items-center rounded-lg ${
                !open
                  ? "justify-center px-0 py-3 w-full"
                  : "justify-start px-3 py-2"
              } ${isLoggingOut ? "opacity-75 cursor-not-allowed" : ""}`}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <div
                    className={`animate-spin rounded-full border-2 border-current border-t-transparent shrink-0 ${!open ? "h-6 w-6" : "h-4 w-4"}`}
                  ></div>
                  {open && <span className="ml-3">Logging out...</span>}
                </>
              ) : (
                <>
                  <LogOut
                    className={`${!open ? "h-6 w-6" : "h-4 w-4"} shrink-0`}
                  />
                  {open && <span className="ml-3">Logout</span>}
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
