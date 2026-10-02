import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Calculator, Mail, CalendarClock, BookOpen, Users, ShieldCheck, Building2 } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Cost Estimator", url: "/estimator", icon: Calculator },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Task Planner", url: "/planner", icon: CalendarClock },
  { title: "Research Assistant", url: "/research", icon: BookOpen },
  { title: "Architects", url: "/architects", icon: Users },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-sidebar-primary p-2 text-sidebar-primary-foreground"><Building2 className="h-5 w-5" /></div>
          <div className="text-sm font-semibold leading-snug text-sidebar-accent-foreground">AI-Productivity-Assistant Property Holdings</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={path === i.url} className="h-10 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                    <Link to={i.url} onClick={() => setOpenMobile(false)}>
                      <i.icon className="h-4 w-4" /><span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={path === "/responsible-ai"} className="h-10">
              <Link to="/responsible-ai" onClick={() => setOpenMobile(false)}><ShieldCheck className="h-4 w-4" /><span>Responsible AI Use</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
