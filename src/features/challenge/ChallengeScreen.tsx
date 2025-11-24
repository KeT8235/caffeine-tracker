import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Target,
  Clock,
  Coffee,
  CheckCircle2,
  Trophy,
  Calendar,
  Lock,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { challengeAPI } from "@/lib/api";

interface ChallengeScreenProps {
  onBack: () => void;
}

interface Challenge {
  challenge_id: number;
  challenge_code?: number;
  title: string;
  goal: string;
  description: string;
  icon: string;
  status: "not started" | "in progress" | "claimable" | "completed" | "failed" | "locked";
  progress?: number;
  daysLeft?: number;
  reward?: string;
  target_type?: "DAILY" | "STREAK" | "CUMULATIVE";
}

export function ChallengeScreen({ onBack }: ChallengeScreenProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null,
  );
  const [isClaimingChallenge, setIsClaimingChallenge] = useState(false);
  const defaultChallenges: Challenge[] = [
    {
      challenge_id: 1,
      title: "일일 카페인 제한 챌린지",
      goal: "하루 카페인 섭취량 400mg 이하 유지",
      description:
        "건강한 카페인 섭취를 위해 하루 최대 권장량인 400mg를 넘지 않도록 관리하세요. 성인의 경우 하루 400mg 이하가 안전한 수준입니다.",
      icon: "☕",
      status: "in progress",
      progress: 65,
      daysLeft: 5,
      reward: "건강 마스터 배지 🏆",
    },
    {
      challenge_id: 2,
      title: "카페인 50% 감량 챌린지",
      goal: "평균 카페인 섭취량 50% 감소",
      description:
        "지난 주 평균 카페인 섭취량 대비 50%를 줄여보세요. 점진적인 감소로 건강한 습관을 만들어갑니다.",
      icon: "📉",
      status: "not started",
      reward: "감량 챔피언 배지 🎖️",
    },
    {
      challenge_id: 3,
      title: "오후 5시 이후 제로 카페인",
      goal: "오후 5시 이후 카페인 섭취 금지",
      description:
        "좋은 수면을 위해 오후 5시 이후에는 카페인 음료를 피하세요. 카페인의 반감기는 약 5-6시간입니다.",
      icon: "🌙",
      status: "in progress",
      progress: 40,
      daysLeft: 9,
      reward: "수면 수호자 배지 😴",
    },
    {
      challenge_id: 4,
      title: "디카페인 전환 챌린지",
      goal: "매일 최소 1잔의 디카페인 음료",
      description:
        "하루에 최소 한 잔은 디카페인 음료로 대체하세요. 맛은 유지하면서 카페인은 줄일 수 있습니다.",
      icon: "🍵",
      status: "completed",
      progress: 100,
      reward: "디카페인 마스터 배지 ✨",
    },
    {
      challenge_id: 5,
      title: "주말 카페인 프리 챌린지",
      goal: "주말 동안 완전한 카페인 제로",
      description:
        "주말 이틀 동안 카페인 없이 지내보세요. 몸의 카페인 의존도를 낮추는 데 도움이 됩니다.",
      icon: "🎯",
      status: "not started",
      reward: "주말 워리어 배지 🏅",
    },
  ];

  const [challenges, setChallenges] = useState<Challenge[]>(defaultChallenges);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(0);

  // 서버에서 챌린지 목록 로드
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setIsLoading(true);
        const response = await challengeAPI.getChallenges();
        
        // 서버 데이터를 로컬 Challenge 형식으로 변환
        const formattedChallenges = response.challenges.map(sc => ({
          challenge_id: sc.challenge_id,
          challenge_code: sc.challenge_code,
          title: sc.title,
          goal: sc.goal,
          description: sc.description,
          icon: sc.icon || "🎯",
          status: sc.status,
          progress: sc.progress,
          daysLeft: sc.daysLeft,
          reward: sc.reward,
          target_type: sc.target_type,
        }));
        
        setChallenges(formattedChallenges);
        setCurrentPoints(response.currentPoints);
      } catch (error) {
        console.error("Failed to load challenges:", error);
        alert("챌린지 목록을 불러오는데 실패했습니다. 기본 챌린지를 표시합니다.");
        // 에러 시 기본 챌린지 사용
        setChallenges(defaultChallenges);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChallenges();
  }, []);

  // 챌린지 완료 처리
  const handleClaimChallenge = async (challengeCode: number) => {
    if (!challengeCode) return;
    
    setIsClaimingChallenge(true);
    try {
      await challengeAPI.claimChallenge(challengeCode);
      alert("챌린지 완료! 포인트를 획득했습니다.");
      
      // 챌린지 목록 새로고침
      const response = await challengeAPI.getChallenges();
      const formattedChallenges = response.challenges.map(sc => ({
        challenge_id: sc.challenge_id,
        challenge_code: sc.challenge_code,
        title: sc.title,
        goal: sc.goal,
        description: sc.description,
        icon: sc.icon || "🎯",
        status: sc.status,
        progress: sc.progress,
        daysLeft: sc.daysLeft,
        reward: sc.reward,
        target_type: sc.target_type,
      }));
      setChallenges(formattedChallenges);
      setCurrentPoints(response.currentPoints);
      setSelectedChallenge(null);
    } catch (error: any) {
      console.error("Failed to claim challenge:", error);
      alert(error.response?.data?.error || "챌린지 완료 처리에 실패했습니다.");
    } finally {
      setIsClaimingChallenge(false);
    }
  };

  // 챌린지 잠금 여부 확인
  const hasLockedChallenges = challenges.some(c => c.status === "locked");

  // 일일 미션과 장기 미션 분리
  const dailyChallenges = challenges.filter(
    (challenge) => challenge.target_type === "DAILY" && challenge.status !== "completed"
  );
  
  const longtermChallenges = challenges.filter(
    (challenge) => 
      (challenge.target_type === "CUMULATIVE" || challenge.target_type === "STREAK") &&
      challenge.status !== "completed"
  );
  
  const completedChallenges = challenges.filter(
    (challenge) => challenge.status === "completed"
  );

  const getStatusColor = (status: Challenge["status"]) => {
    switch (status) {
      case "in progress":
        return "bg-blue-500";
      case "claimable":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      case "failed":
        return "bg-red-500";
      case "locked":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: Challenge["status"]) => {
    switch (status) {
      case "in progress":
        return "진행중";
      case "claimable":
        return "완료 가능";
      case "completed":
        return "완료";
      case "failed":
        return "실패";
      case "locked":
        return "잠김";
      default:
        return "시작 전";
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
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

          <h1 className="text-[24px]">카페인 챌린지</h1>

          <div className="flex items-center space-x-1">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-[16px] font-semibold text-amber-500">{currentPoints}P</span>
          </div>
        </div>

      </div>

      {/* Stats Summary */}
      <div className="px-6 py-4">
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-[28px] text-primary">
                {challenges.filter((c) => c.status === "in progress").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">진행중</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-[28px] text-green-600">
                {challenges.filter((c) => c.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">완료</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-[28px]">{challenges.length}</div>
              <p className="text-xs text-muted-foreground mt-1">전체</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Challenge List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground mt-4">챌린지를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 챌린지 잠금 경고 메시지 */}
            {hasLockedChallenges && (
              <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      챌린지가 잠겼습니다
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      일일 카페인 제한량이 권장량(600mg)을 초과하여 챌린지가 잠겼습니다.
                      챌린지를 이용하시려면 프로필에서 일일 카페인 제한을 600mg 이하로 설정해주세요.
                    </p>
                  </div>
                </div>
              </Card>
            )}
            {/* 일일 미션 섹션 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">일일 미션</h2>
                <span className="text-sm text-muted-foreground">({dailyChallenges.length})</span>
              </div>
              
              {dailyChallenges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  진행중인 일일 미션이 없습니다
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.challenge_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <motion.div
                        whileHover={challenge.status !== "locked" ? { scale: 1.01, x: 4 } : {}}
                        whileTap={challenge.status !== "locked" ? { scale: 0.99 } : {}}
                        onClick={() => challenge.status !== "locked" && setSelectedChallenge(challenge)}
                      >
                        <Card className={`p-4 transition-colors relative ${
                          challenge.status === "locked" 
                            ? "bg-gray-100 dark:bg-gray-800 opacity-70 cursor-not-allowed" 
                            : "bg-card hover:bg-secondary/20 cursor-pointer"
                        }`}>
                          <div className="flex items-start space-x-4">
                            {/* Icon */}
                            <div className="text-[32px] flex-shrink-0">
                              {challenge.status === "locked" ? <Lock className="w-8 h-8 text-gray-400" /> : challenge.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 pr-2">
                                  <h3 className="text-[16px] mb-1">
                                    {challenge.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {challenge.goal}
                                  </p>
                                </div>
                                <Badge
                                  className={`${getStatusColor(challenge.status)} text-white border-0 text-xs px-2 py-0.5 flex-shrink-0`}
                                >
                                  {getStatusText(challenge.status)}
                                </Badge>
                              </div>

                              {/* Progress Bar (for in progress challenges) */}
                              {challenge.status === "in progress" &&
                                challenge.progress !== undefined && (
                                  <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        진행률
                                      </span>
                                      <span className="text-primary">
                                        {challenge.progress}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={challenge.progress}
                                      className="h-2"
                                    />
                                    {challenge.daysLeft && (
                                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>{challenge.daysLeft}일 남음</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-xs text-muted-foreground">•••</span>
              </div>
            </div>

            {/* 장기 미션 섹션 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">장기 미션</h2>
                <span className="text-sm text-muted-foreground">({longtermChallenges.length})</span>
              </div>
              
              {longtermChallenges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  진행중인 장기 미션이 없습니다
                </div>
              ) : (
                <div className="space-y-3">
                  {longtermChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.challenge_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <motion.div
                        whileHover={challenge.status !== "locked" ? { scale: 1.01, x: 4 } : {}}
                        whileTap={challenge.status !== "locked" ? { scale: 0.99 } : {}}
                        onClick={() => challenge.status !== "locked" && setSelectedChallenge(challenge)}
                      >
                        <Card className={`p-4 transition-colors relative ${
                          challenge.status === "locked" 
                            ? "bg-gray-100 dark:bg-gray-800 opacity-70 cursor-not-allowed" 
                            : "bg-card hover:bg-secondary/20 cursor-pointer"
                        }`}>
                          <div className="flex items-start space-x-4">
                            {/* Icon */}
                            <div className="text-[32px] flex-shrink-0">
                              {challenge.status === "locked" ? <Lock className="w-8 h-8 text-gray-400" /> : challenge.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 pr-2">
                                  <h3 className="text-[16px] mb-1">
                                    {challenge.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {challenge.goal}
                                  </p>
                                </div>
                                <Badge
                                  className={`${getStatusColor(challenge.status)} text-white border-0 text-xs px-2 py-0.5 flex-shrink-0`}
                                >
                                  {getStatusText(challenge.status)}
                                </Badge>
                              </div>

                              {/* Progress Bar (for in progress challenges) */}
                              {challenge.status === "in progress" &&
                                challenge.progress !== undefined && (
                                  <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        진행률
                                      </span>
                                      <span className="text-primary">
                                        {challenge.progress}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={challenge.progress}
                                      className="h-2"
                                    />
                                    {challenge.daysLeft && (
                                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>{challenge.daysLeft}일 남음</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 완료된 챌린지 섹션 */}
            {completedChallenges.length > 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-xs text-muted-foreground">•••</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold">완료된 챌린지</h2>
                    <span className="text-sm text-muted-foreground">({completedChallenges.length})</span>
                  </div>
                  
                  <div className="space-y-3">
                    {completedChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.challenge_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedChallenge(challenge)}
                        >
                          <Card className="p-4 bg-card hover:bg-secondary/20 transition-colors cursor-pointer">
                            <div className="flex items-start space-x-4">
                              <div className="text-[32px] flex-shrink-0">
                                {challenge.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 pr-2">
                                    <h3 className="text-[16px] mb-1">
                                      {challenge.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {challenge.goal}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`${getStatusColor(challenge.status)} text-white border-0 text-xs px-2 py-0.5 flex-shrink-0`}
                                  >
                                    {getStatusText(challenge.status)}
                                  </Badge>
                                </div>
                                {challenge.status === "completed" && (
                                  <div className="mt-3 flex items-center space-x-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600">
                                      획득: {challenge.reward}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Challenge Detail Modal */}
      <Dialog
        open={!!selectedChallenge}
        onOpenChange={() => setSelectedChallenge(null)}
      >
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-xl">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-[40px]">{selectedChallenge?.icon}</span>
              <div className="flex-1">
                <DialogTitle className="text-[20px]">
                  {selectedChallenge?.title}
                </DialogTitle>
                <Badge
                  className={`${getStatusColor(selectedChallenge?.status || "not started")} text-white border-0 text-xs mt-1`}
                >
                  {getStatusText(selectedChallenge?.status || "not started")}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Goal */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-primary" />
                <h4 className="text-sm">목표</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {selectedChallenge?.goal}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-primary" />
                <h4 className="text-sm">설명</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {selectedChallenge?.description}
              </p>
            </div>

            {/* Reward */}
            {selectedChallenge?.reward && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <h4 className="text-sm">보상</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {selectedChallenge.reward}
                </p>
              </div>
            )}

            {/* Progress (if in progress) */}
            {selectedChallenge?.status === "in progress" &&
              selectedChallenge.progress !== undefined && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>현재 진행률</span>
                    <span className="text-primary">
                      {selectedChallenge.progress}%
                    </span>
                  </div>
                  <Progress
                    value={selectedChallenge.progress}
                    className="h-2"
                  />
                  {selectedChallenge.daysLeft && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>남은 기간: {selectedChallenge.daysLeft}일</span>
                    </div>
                  )}
                </div>
              )}
            
            {/* 버튼 영역 */}
            <div className="flex flex-col gap-2 w-full pt-2">
              {selectedChallenge?.status === "claimable" && (
                <Button
                  className="w-full rounded-full"
                  onClick={() => handleClaimChallenge(selectedChallenge.challenge_code!)}
                  disabled={isClaimingChallenge}
                >
                  {isClaimingChallenge ? "처리 중..." : "완료하기"}
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => setSelectedChallenge(null)}
              >
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
