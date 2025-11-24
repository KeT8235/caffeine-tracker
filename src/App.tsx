import { useState, useEffect } from "react";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { AIChatbotScreen } from "@/features/ai-chatbot/AIChatbotScreen";
import { TrackingScreen } from "@/features/tracking/TrackingScreen";
import { FriendsScreen } from "@/features/social/FriendsScreen";
import { ChatScreen } from "@/features/social/ChatScreen";
import { ChallengeScreen } from "@/features/challenge/ChallengeScreen";
import { ShopScreen } from "@/features/shop/ShopScreen";
import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { BottomNavigation } from "@/components/common/BottomNavigation";
import { CaffeineProvider } from "@/contexts/CaffeineContext";
import { AppProviders } from "@/contexts/AppProviders";
import { Toaster } from "@/components/ui/sonner";
import type { Friend } from "@/types";
import "@/i18n/config";
import { useTranslation } from "react-i18next";
import { profileAPI } from "@/lib/api";

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeScreen, setActiveScreen] = useState("home");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const { i18n } = useTranslation();

  // 사용자 언어 설정 로드
  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const profile = await profileAPI.getProfile();
          if (profile.language_code) {
            i18n.changeLanguage(profile.language_code);
          }
        }
      } catch (error) {
        console.error("Failed to load user language:", error);
      }
    };
    
    if (hasOnboarded) {
      loadUserLanguage();
    }
  }, [hasOnboarded, i18n]);

  const handleGetStarted = () => {
    setHasOnboarded(true);
  };

  const handleNavigate = (screen: string) => {
    setActiveScreen(screen);
  };

  const handleBackToHome = () => {
    setActiveScreen("home");
  };

  const handleBackToFriends = () => {
    setActiveScreen("friends");
    setSelectedFriend(null);
  };

  const handleFriendClick = (friend: Friend) => {
    setSelectedFriend(friend);
    setActiveScreen("chat");
  };

  const handleLogout = () => {
    setHasOnboarded(false);
    setActiveScreen("home");
  };

  if (!hasOnboarded) {
    return (
      <div className="h-screen max-w-md mx-auto bg-background">
        <OnboardingScreen onGetStarted={handleGetStarted} />
      </div>
    );
  }

  return (
      <AppProviders>
    <CaffeineProvider>
      <div className="h-screen max-w-md mx-auto bg-background flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden pb-20">
          {activeScreen === "home" && (
            <DashboardScreen onNavigate={handleNavigate} />
          )}
          {activeScreen === "aichat" && (
            <AIChatbotScreen onBack={handleBackToHome} />
          )}
          {activeScreen === "tracking" && (
            <TrackingScreen onBack={handleBackToHome} />
          )}
          {activeScreen === "friends" && (
            <FriendsScreen
              onBack={handleBackToHome}
              onFriendClick={handleFriendClick}
            />
          )}
          {activeScreen === "chat" && selectedFriend && (
            <ChatScreen friend={selectedFriend} onBack={handleBackToFriends} />
          )}
          {activeScreen === "challenge" && (
            <ChallengeScreen onBack={handleBackToHome} />
          )}
          {activeScreen === "shop" && (
            <ShopScreen onBack={handleBackToHome} />
          )}
          {activeScreen === "profile" && (
            <ProfileScreen onBack={handleBackToHome} onLogout={handleLogout} />
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeScreen}
          onNavigate={handleNavigate}
        />

        {/* Toast Notifications */}
        <Toaster position="top-center" />
      </div>
    </CaffeineProvider>
      </AppProviders>
  );
}
