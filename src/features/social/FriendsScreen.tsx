import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  ChevronLeft,
  UserPlus,
  Bell,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Friend } from "@/types";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { friendAPI } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { useCaffeine } from "@/contexts/CaffeineContext";

interface FriendsScreenProps {
  onBack: () => void;
  onFriendClick: (friend: Friend) => void;
}

interface FriendRequest {
  request_id: number;
  requester_id: number;
  username: string;
  name: string;
  profile_photo: string | null;
  created_at: string;
}

interface DBFriend {
  member_id: number;
  username: string;
  name: string;
  profile_photo: string | null;
  current_caffeine: number;
  max_caffeine: number;
  last_intake_time: string | null;
}

export function FriendsScreen({ onBack, onFriendClick }: FriendsScreenProps) {
  const { t } = useTranslation();
  const { currentIntake, dailyLimit } = useCaffeine();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [friends, setFriends] = useState<DBFriend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [currentUserName, setCurrentUserName] = useState("나");
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequests, setShowRequests] = useState(false);

  // 친구 목록 및 요청 로드
  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    
    // 현재 사용자 프로필 불러오기
    const loadCurrentUser = async () => {
      try {
        const { profileAPI } = await import("@/lib/api");
        const profile = await profileAPI.getProfile();
        setCurrentUserName(profile.name);
        if (profile.profile_photo) {
          setCurrentUserPhoto(profile.profile_photo);
        }
      } catch (error) {
        console.error("Failed to load current user profile:", error);
      }
    };
    loadCurrentUser();
  }, []);

  const loadFriends = async () => {
    try {
      console.log("친구 목록 로드 시작...");
      const data = await friendAPI.getFriends();
      console.log("친구 목록 로드 완료:", data.friends);
      setFriends(data.friends);
    } catch (error: any) {
      console.error("친구 목록 로드 실패:", error);
      toast.error("친구 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const data = await friendAPI.getFriendRequests();
      setFriendRequests(data.requests);
    } catch (error: any) {
      console.error("친구 요청 로드 실패:", error);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!friendUsername.trim()) {
      toast.error("친구의 이름을 입력해주세요.");
      return;
    }

    try {
      const result = await friendAPI.sendFriendRequest(friendUsername.trim());
      toast.success(result.message, {
        description: `${result.receiver.name}님에게 친구 요청을 보냈습니다.`,
      });
      setShowAddFriend(false);
      setFriendUsername("");
    } catch (error: any) {
      toast.error(error.message || "친구 요청 중 오류가 발생했습니다.");
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const result = await friendAPI.acceptFriendRequest(requestId);
      toast.success(result.message, {
        description: `${result.friend.name}님이 친구로 추가되었습니다.`,
      });
      
      // 친구 목록과 요청 목록 새로고침
      await loadFriends();
      await loadFriendRequests();
    } catch (error: any) {
      toast.error(error.message || "친구 요청 수락 중 오류가 발생했습니다.");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      const result = await friendAPI.rejectFriendRequest(requestId);
      toast.success(result.message);
      loadFriendRequests();
    } catch (error: any) {
      toast.error(error.message || "친구 요청 거절 중 오류가 발생했습니다.");
    }
  };

  const getCaffeineStatus = (level: number, maxLevel: number = 400) => {
    const percentage = (level / maxLevel) * 100;
    
    if (percentage >= 100) {
      return {
        color: "bg-red-500",
        label: t("dashboard.high"),
        textColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    } else if (percentage >= 75) {
      return {
        color: "bg-red-500",
        label: t("dashboard.high"),
        textColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    } else if (percentage >= 50) {
      return {
        color: "bg-yellow-500",
        label: t("dashboard.caution"),
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    } else {
      return {
        color: "bg-green-500",
        label: t("dashboard.safe"),
        textColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    }
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2);
  };

  const getAvatarColor = (id: number) => {
    const colors = [
      "from-red-500 to-orange-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-amber-500",
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-indigo-500 to-blue-500",
    ];
    return colors[id % colors.length];
  };

  const sortedFriends = [...friends].sort(
    (a, b) => (b.current_caffeine || 0) - (a.current_caffeine || 0)
  );

  const myCaffeineLevel = Math.round(currentIntake);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onBack}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </motion.div>

          <h1 className="text-[24px]">{t("friends.title")}</h1>

          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => {
                  loadFriends();
                  toast.success(t("friends.loadFailed"));
                }}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
                onClick={() => setShowRequests(true)}
              >
                <Bell className="w-6 h-6" />
                {friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {friendRequests.length}
                  </span>
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setShowAddFriend(true)}
              >
                <UserPlus className="w-6 h-6" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* My Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 border-3 border-primary rounded-full overflow-hidden">
                    <ProfileAvatar
                      name={currentUserName}
                      size="lg"
                      profilePhoto={currentUserPhoto}
                      className="w-full h-full border-0"
                    />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 ${getCaffeineStatus(myCaffeineLevel, dailyLimit).color} rounded-full border-2 border-background shadow-md`}
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[18px]">{t("friends.caffeineStatus")}</span>
                    <Badge
                      className={`${getCaffeineStatus(myCaffeineLevel, dailyLimit).bgColor} ${getCaffeineStatus(myCaffeineLevel, dailyLimit).textColor} border-0`}
                    >
                      {getCaffeineStatus(myCaffeineLevel, dailyLimit).label}
                    </Badge>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span
                      className={`text-[24px] ${getCaffeineStatus(myCaffeineLevel, dailyLimit).textColor}`}
                    >
                      {myCaffeineLevel}
                    </span>
                    <span className="text-sm text-muted-foreground">mg</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Friends List Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[18px]">친구 목록</h3>
          <span className="text-sm text-muted-foreground">
            {friends.length}명
          </span>
        </div>

        {/* Friends List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : friends.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              아직 친구가 없습니다
            </p>
            <Button onClick={() => setShowAddFriend(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              친구 추가하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedFriends.map((friend, index) => {
              const status = getCaffeineStatus(friend.current_caffeine || 0, friend.max_caffeine || 400);
              const friendData: Friend = {
                id: friend.member_id,
                name: friend.name,
                initials: getInitials(friend.name),
                caffeineLevel: friend.current_caffeine || 0,
                avatarColor: getAvatarColor(friend.member_id),
                trend: "stable",
                lastDrink: friend.last_intake_time || "기록 없음",
              };

              return (
                <motion.div
                  key={friend.member_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onFriendClick(friendData)}
                  >
                    <Card className="p-4 bg-card hover:bg-secondary/20 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 border-2 border-border/50 rounded-full overflow-hidden">
                              <ProfileAvatar
                                name={friend.name}
                                size="lg"
                                profilePhoto={friend.profile_photo}
                                className="w-full h-full border-0"
                              />
                            </div>
                            <motion.div
                              className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 ${status.color} rounded-full border-2 border-background shadow-md`}
                              animate={{
                                scale:
                                  friendData.caffeineLevel >= 300
                                    ? [1, 1.2, 1]
                                    : 1,
                                opacity:
                                  friendData.caffeineLevel >= 300
                                    ? [1, 0.7, 1]
                                    : 1,
                              }}
                              transition={{
                                duration: 2,
                                repeat:
                                  friendData.caffeineLevel >= 300 ? Infinity : 0,
                                ease: "easeInOut",
                              }}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-0.5">
                              <span className="text-[16px]">{friend.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {status.label}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 ml-3">
                          <div className="flex items-baseline space-x-1">
                            <motion.span
                              className={`text-[24px] ${status.textColor}`}
                              key={friendData.caffeineLevel}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              {friendData.caffeineLevel}
                            </motion.span>
                            <span className="text-xs text-muted-foreground">
                              mg
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`mt-1 ${status.bgColor} ${status.textColor} ${status.borderColor} text-[10px] px-2 py-0`}
                          >
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Add Friend Dialog */}
      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 gap-0">
          <div className="flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
              <DialogTitle className="text-[20px]">{t("friends.addFriend")}</DialogTitle>
              <DialogDescription className="text-[14px]">
                {t("friends.addFriendDesc")}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="friend-username" className="text-[14px]">
                  {t("friends.searchUsername")}
                </Label>
                <Input
                  id="friend-username"
                  placeholder={t("friends.usernamePlaceholder")}
                  className="h-12 text-[16px] rounded-xl"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendFriendRequest();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="flex flex-col space-y-2 pt-2">
                <Button
                  className="w-full h-12 rounded-xl text-[16px]"
                  onClick={handleSendFriendRequest}
                  disabled={!friendUsername.trim()}
                >
                  {t("friends.sendRequest")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl text-[16px]"
                  onClick={() => {
                    setShowAddFriend(false);
                    setFriendUsername("");
                  }}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Friend Requests Dialog */}
      <Dialog open={showRequests} onOpenChange={setShowRequests}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 gap-0">
          <div className="flex flex-col max-h-[80vh]">
            <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
              <DialogTitle className="text-[20px]">{t("friends.friendRequests")}</DialogTitle>
              <DialogDescription className="text-[14px]">
                {t("friends.noRequests")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {friendRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("friends.noRequests")}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {friendRequests.map((request) => (
                      <motion.div
                        key={request.request_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                      >
                        <Card className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <ProfileAvatar
                                name={request.name}
                                size="md"
                                profilePhoto={request.profile_photo}
                                className="w-12 h-12"
                              />
                              <div>
                                <p className="text-[16px] font-medium">
                                  {request.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  @{request.username}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="icon"
                                className="rounded-full w-10 h-10 bg-green-500 hover:bg-green-600"
                                onClick={() =>
                                  handleAcceptRequest(request.request_id)
                                }
                              >
                                <Check className="w-5 h-5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full w-10 h-10"
                                onClick={() =>
                                  handleRejectRequest(request.request_id)
                                }
                              >
                                <X className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
