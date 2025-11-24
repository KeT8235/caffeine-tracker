import { Home, Target, MessageCircle, Users, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BottomNavigationProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function BottomNavigation({
  activeTab,
  onNavigate,
}: BottomNavigationProps) {
  const { t } = useTranslation();
  
  const tabs = [
    { id: "aichat", icon: MessageCircle, label: t("navigation.chat") },
    { id: "challenge", icon: Target, label: t("challenge.title") },
    { id: "home", icon: Home, label: t("navigation.home") },
    { id: "friends", icon: Users, label: t("navigation.friends") },
    { id: "profile", icon: User, label: t("navigation.profile") },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 py-2 px-4 rounded-xl transition-all ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform`}
              />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
