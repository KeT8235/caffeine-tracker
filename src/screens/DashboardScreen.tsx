import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  Coffee,
  Sparkles,
  Plus,
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  AlertCircle,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { CaffeineHalfLifeCurve } from "@/features/caffeine/CaffeineHalfLifeCurve";
import { useCaffeine } from "@/contexts/CaffeineContext";
import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAlertSetting } from "@/contexts/AlertContext";
import { menuAPI, getToken } from "@/lib/api";

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
    const { alertsEnabled } = useAlertSetting();
    const safeToast = {
      success: (msg: string, opts?: any) => alertsEnabled && toast.success(msg, opts),
      error: (msg: string, opts?: any) => alertsEnabled && toast.error(msg, opts),
      warning: (msg: string, opts?: any) => alertsEnabled && toast.warning(msg, opts),
    };
  const {
    currentIntake,
    dailyLimit,
    getCaffeineStatus,
    remainingCaffeine,
    entries,
    addCaffeine,
    fetchAndUpdate,
  } = useCaffeine();

  // 기록 삭제 및 초기화 관련
  const [isResetting, setIsResetting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localEntries, setLocalEntries] = useState(entries);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // 개별 기록 삭제
  const handleDeleteEntry = async (entryId: string) => {
    setDeletingId(entryId);
    try {
      const token = getToken();
      await fetch(`/api/caffeine/history/${entryId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (fetchAndUpdate) await fetchAndUpdate();
    } catch (e) {
      alert('삭제 실패');
    } finally {
      setDeletingId(null);
    }
  };

  // 전체 기록 초기화
  const handleResetAll = async () => {
    if (!window.confirm('정말로 오늘의 모든 기록을 삭제하시겠습니까?')) return;
    setIsResetting(true);
    try {
      const token = getToken();
      await fetch('/api/caffeine/today', {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (fetchAndUpdate) await fetchAndUpdate();
    } catch (e) {
      alert('초기화 실패');
    } finally {
      setIsResetting(false);
    }
  };
  
  const percentage = useMemo(() => {
    const percent = (currentIntake / dailyLimit) * 100;
    return percent;
  }, [currentIntake, dailyLimit]);
  
  const status = getCaffeineStatus();
  const [openHistory, setOpenHistory] = useState(false);

  // 사용자 정보 가져오기
  const [userName, setUserName] = useState("홍길동");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [customMenus, setCustomMenus] = useState<
    Array<{
      custom_menu_id: number;
      member_id: number;
      menu_name: string;
      caffeine_mg: number;
      created_at: string;
    }>
  >([]);

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const userProfile = localStorage.getItem("user_profile");
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        setUserName(profile.name || "홍길동");
        setProfilePhoto(profile.profile_photo || null);
      } catch (error) {
        console.error("Failed to parse user profile:", error);
      }
    }

    // 현재 날짜 형식화
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const days = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    const dayName = days[now.getDay()];
    setCurrentDate(`${month}월 ${date}일 ${dayName}`);

    // 커스텀 음료 불러오기
    loadCustomMenus();
  }, []);

  const loadCustomMenus = async () => {
    try {
      const data = await menuAPI.getCustomMenus();
      setCustomMenus(data);
    } catch (error) {
      console.error("Failed to load custom menus:", error);
    }
  };

  // 일일 권장량 초과 시 알림 표시
  useEffect(() => {
    if (currentIntake > dailyLimit) {
      const exceededAmount = currentIntake - dailyLimit;
      const percentage = Math.round((currentIntake / dailyLimit) * 100);
      safeToast.error("⚠️ 일일 권장량 초과!", {
        description: `현재 ${currentIntake.toFixed(0)}mg으로 권장량의 ${percentage}%입니다. (${exceededAmount.toFixed(0)}mg 초과)`,
        duration: 6000,
      });
    } else if (currentIntake >= dailyLimit * 0.75) {
      safeToast.warning("카페인 섭취 주의", {
        description: "일일 권장량에 근접했습니다. 섭취를 모니터링 해주세요.",
        duration: 5000,
      });
    }
  }, [currentIntake, dailyLimit, alertsEnabled]);

  const statusConfig = {
    safe: {
      icon: Shield,
      label: "안전",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    caution: {
      icon: AlertTriangle,
      label: "주의",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    high: {
      icon: AlertCircle,
      label: "높음",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const recentEntries = entries.slice(-3).reverse();

  // 특정 음료(예: 컴포즈 에스프레소)의 최근 활동 아이콘 이미지 매핑
  const recentDrinkImages: Record<string, string> = {
    // 컴포즈 커피
    "컴포즈-에스프레소":
      "https://composecoffee.com/files/thumbnails/208/1515x2083.crop.jpg?t=1733792158",
    "컴포즈-아메리카노":
      "https://img.danawa.com/prod_img/500000/312/718/img/13718312_1.jpg?_v=20240103134302",
    "컴포즈-카페라떼":
      "https://composecoffee.com/files/attach/images/152/459/038/bee8306016d78d10e673d14a6d8e30d8.jpg",
    "컴포즈-콜드브루":
      "https://composecoffee.com/files/thumbnails/627/038/1515x2083.crop.jpg?t=1761948671",

    // 메가커피
    "메가-아메리카노":
      "https://img.79plus.co.kr/megahp/manager/upload/menu/20250320000925_1742396965069_ekSqAIVc1L.jpg",
    "메가-카페라떼":
      "https://img.79plus.co.kr/megahp/manager/upload/menu/20250320004527_1742399127150_aZXw3Wbf4H.jpg",
    "메가-에스프레소":
      "https://img.79plus.co.kr/megahp/manager/upload/menu/20250320002019_1742397619030_g5iEBTRsp7.jpg",

    // 스타벅스
    "스타벅스-아메리카노":
      "https://img1.kakaocdn.net/thumb/C305x305@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20231010111814_9a667f9eccc943648797925498bdd8a3.jpg",
    "스타벅스-카페라떼":
      "https://img.danawa.com/prod_img/500000/445/034/img/3034445_1.jpg?_v=20251112132218",
    "스타벅스-에스프레소":
      "https://www.nespresso.com/shared_res/agility/global/coffees/vl/sku-main-info-product/starbucks-espresso-roast_2x.png?impolicy=medium&imwidth=824&imdensity=1",
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[24px]">오늘의 섭취량</h1>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-0"
            onClick={() => onNavigate("profile")}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ProfileAvatar
                name={userName}
                size="sm"
                profilePhoto={profilePhoto}
                className="w-10 h-10"
              />
            </motion.div>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">{currentDate}</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 space-y-6">
        {/* Caffeine Progress Circle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/10">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-52 h-52 flex items-center justify-center">
                {/* 상태별 색상 계산 */}
                {(() => {
                  let circleColor = '#22c55e'; // green-500
                  let iconColor = 'text-green-500';
                  let percent = percentage;
                  if (percent >= 100) {
                    circleColor = '#ef4444'; // red-500
                    percent = 100;
                    iconColor = 'text-red-500 animate-pulse';
                  } else if (percent >= 75) {
                    // 위험: 빨강
                    circleColor = '#ef4444';
                    iconColor = 'text-red-500 animate-pulse';
                  } else if (percent >= 50) {
                    // 주의: 노랑
                    circleColor = '#eab308'; // yellow-500
                    iconColor = 'text-yellow-500';
                  }
                  return (
                    <>
                      {/* 배경 원 (회색) */}
                      <svg className="w-48 h-48 absolute transform -rotate-90" style={{ overflow: 'visible' }}>
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="rgba(0, 0, 0, 0.05)"
                          strokeWidth="14"
                          fill="none"
                        />
                      </svg>
                      {/* 진행 원 (색상) */}
                      <svg className="w-48 h-48 transform -rotate-90" style={{ overflow: 'visible' }}>
                        <motion.circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke={circleColor}
                          strokeWidth="14"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                          animate={{
                            strokeDashoffset:
                              2 * Math.PI * 88 * (1 - percent / 100),
                          }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                          filter={`drop-shadow(0 0 8px ${circleColor}80)`}
                        />
                      </svg>
                      {/* Center Content */}
                      <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        <Coffee className={`w-10 h-10 mb-2 ${iconColor}`} />
                        <motion.div
                          className="text-[40px] font-bold leading-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                          style={{ color: circleColor }}
                        >
                          {currentIntake.toFixed(0)}
                        </motion.div>
                        <div className="text-base text-muted-foreground font-medium">mg 카페인</div>
                      </motion.div>
                    </>
                  );
                })()}
              </div>

              <div className="text-center space-y-2">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentStatus.bgColor} border ${currentStatus.borderColor}`}
                >
                  <StatusIcon className={`w-4 h-4 ${currentStatus.color}`} />
                  <span className={`text-sm ${currentStatus.color}`}>
                    {currentStatus.label}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  일일 권장량의{" "}
                  <span className="text-primary">
                    {Math.round(percentage)}%
                  </span>{" "}
                  섭취했어요
                </p>
                <p className="text-muted-foreground text-sm">
                  <span className="text-foreground">
                    {remainingCaffeine.toFixed(0)}mg
                  </span>{" "}
                  남음
                </p>
              </div>

              {/* Half-life Curve */}
              <div className="w-full mt-4 pt-4 border-t border-border/30">
                <CaffeineHalfLifeCurve currentAmount={currentIntake} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Dialog open={openHistory} onOpenChange={setOpenHistory}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="p-4 bg-card hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setOpenHistory(true)}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-xl p-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        오늘 마신 음료
                      </div>
                      <div className="text-[20px]">{entries.length}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">오늘의 섭취 기록 전체</h2>
                <Button variant="destructive" size="sm" onClick={handleResetAll} disabled={isResetting}>
                  전체 초기화
                </Button>
              </div>
              {localEntries.length > 0 ? (
                <div className="space-y-2">
                  {localEntries.slice().reverse().map((entry) => (
                    <Card key={entry.id} className="p-4 bg-card flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 rounded-xl p-2 flex items-center justify-center">
                          <Coffee className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p>{entry.drink}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.brand} • {entry.caffeine}mg
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)} disabled={deletingId === entry.id}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 bg-card text-center">
                  <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground text-sm">아직 추가된 음료가 없습니다</p>
                  <p className="text-xs text-muted-foreground mt-1">음료를 추가해보세요!</p>
                </Card>
              )}
            </DialogContent>
          </Dialog>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="p-4 bg-card hover:bg-secondary/20 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="bg-accent/20 rounded-xl p-2">
                  <Clock className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    마지막 음료
                  </div>
                  <div className="text-[20px]">
                    {entries.length > 0
                      ? (() => {
                          const lastEntry = entries[entries.length - 1];
                          const now = new Date();
                          const diff =
                            now.getTime() -
                            new Date(lastEntry.timestamp).getTime();
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          const minutes = Math.floor(
                            (diff % (1000 * 60 * 60)) / (1000 * 60),
                          );
                          if (hours > 0) return `${hours}시간 전`;
                          if (minutes > 0) return `${minutes}분 전`;
                          return "방금";
                        })()
                      : "-"}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Custom Menus - 저장한 커스텀 음료 */}
        {customMenus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <h3 className="mb-3 text-[18px]">저장한 커스텀 음료</h3>
            <div className="grid grid-cols-2 gap-2">
              {customMenus.map((menu, index) => (
                <motion.div
                  key={menu.custom_menu_id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-3 bg-card hover:bg-secondary/20 transition-colors cursor-pointer"
                    onClick={async () => {
                      try {
                        await addCaffeine({
                          brand: "커스텀",
                          drink: menu.menu_name,
                          caffeine: menu.caffeine_mg,
                        });
                        toast.success(`${menu.menu_name}이(가) 추가되었습니다.`);
                      } catch (error) {
                        toast.error("음료 추가 중 오류가 발생했습니다.");
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="bg-purple-500/10 rounded-lg p-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {menu.menu_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {menu.caffeine_mg}mg
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="mb-3 text-[18px]">최근 활동</h3>
          {recentEntries.length > 0 ? (
            <div className="space-y-2">
              {recentEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, delay: index * 0.05 }}
                >
                  <Card 
                    className="p-4 bg-card flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-colors"
                    onClick={async () => {
                      try {
                        await addCaffeine({
                          brand: entry.brand,
                          drink: entry.drink,
                          caffeine: entry.caffeine,
                          menu_id: entry.menu_id,
                          temp: entry.temp,
                        });
                        toast.success(`${entry.drink}이(가) 추가되었습니다.`);
                      } catch (error) {
                        toast.error("음료 추가 중 오류가 발생했습니다.");
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {/* 음료 사진 (menu_photo) */}
                      <div className="bg-primary/10 rounded-xl p-2 flex items-center justify-center">
                        {entry.menu_photo ? (
                          <img
                            src={entry.menu_photo}
                            alt={entry.drink}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <Coffee className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{entry.drink}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.brand}
                          {/* 브랜드 로고 (brand_photo) */}
                          {entry.brand_photo && (
                            <img
                              src={entry.brand_photo}
                              alt={entry.brand + " 로고"}
                              className="inline-block w-5 h-5 ml-1 rounded-full object-contain align-middle"
                            />
                          )}
                          &nbsp;• {entry.caffeine}mg
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        const date = new Date(entry.timestamp);
                        return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
                      })()}
                    </span>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-6 bg-card text-center">
              <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">
                아직 추가된 음료가 없습니다
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                음료를 추가해보세요!
              </p>
            </Card>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="h-14 rounded-2xl bg-primary hover:bg-primary/90 flex items-center gap-2 w-full"
                onClick={() => onNavigate("tracking")}
              >
                <Plus className="w-5 h-5" />
                음료 추가
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                className="h-14 rounded-2xl border-2 border-primary/20 bg-card hover:bg-secondary/30 flex items-center gap-2 w-full"
                onClick={() => onNavigate("aichat")}
              >
                <Sparkles className="w-5 h-5" />
                AI 추천
              </Button>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 flex items-center justify-center gap-2 w-full"
              onClick={() => onNavigate("shop")}
            >
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span className="text-amber-900 dark:text-amber-100 font-semibold">포인트 상점</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* AI Coach Badge */}
      <motion.div
        className="fixed bottom-24 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate("aichat")}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          },
        }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>
    </div>
  );
}
