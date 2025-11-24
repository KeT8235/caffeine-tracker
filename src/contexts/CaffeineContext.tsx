import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { toast } from "sonner";
import type { CaffeineEntry, StatusType } from "@/types";
import { caffeineAPI, getToken } from "@/lib/api";

interface CaffeineContextType {
  currentIntake: number;
  dailyLimit: number;
  entries: CaffeineEntry[];
  addCaffeine: (entry: Omit<CaffeineEntry, "id" | "timestamp">) => void;
  getCaffeineStatus: () => StatusType;
  remainingCaffeine: number;
  hasShownHighAlert: boolean;
  fetchAndUpdate?: () => Promise<void>;
}

const CaffeineContext = createContext<CaffeineContextType | undefined>(
  undefined,
);

const DEFAULT_DAILY_LIMIT = 400; // mg (기본값)
const STORAGE_KEY = "caffeine_tracker_data";
const ALERT_SHOWN_KEY = "caffeine_alert_shown";
const CAFFEINE_HALF_LIFE_HOURS = 5; // 카페인 반감기 (5시간 기준)

function calculateDecayedIntake(entries: CaffeineEntry[], now: Date): number {
  return entries.reduce((total, entry) => {
    const timestamp = new Date(entry.timestamp).getTime();
    const diffMs = now.getTime() - timestamp;

    if (diffMs <= 0) return total;

    const hoursElapsed = diffMs / (1000 * 60 * 60);
    const decayedAmount =
      entry.caffeine * Math.pow(0.5, hoursElapsed / CAFFEINE_HALF_LIFE_HOURS);

    return total + decayedAmount;
  }, 0);
}

export function CaffeineProvider({ children }: { children: ReactNode }) {
  // fetchAndUpdate를 외부에서도 쓸 수 있도록 useRef에 저장
  const fetchAndUpdateRef = useRef<() => Promise<void> | undefined>(undefined);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_DAILY_LIMIT);
  const [entries, setEntries] = useState<CaffeineEntry[]>([]);
  const [hasShownHighAlert, setHasShownHighAlert] = useState(false);
  const [lastResetDate, setLastResetDate] = useState<string>("");
  const [now, setNow] = useState<Date>(new Date());

  const currentIntake = calculateDecayedIntake(entries, now);

  // Load data from API on mount & 주기적으로 fetch
  useEffect(() => {
    const fetchAndUpdate = async () => {
      const token = getToken();
      if (!token) {
        const today = new Date().toDateString();
        resetDailyData(today);
        return;
      }
      try {
        const caffeineInfo = await caffeineAPI.getCurrentInfo();
        setDailyLimit(caffeineInfo.max_caffeine);
        const history = await caffeineAPI.getTodayHistory();
        const todayEntries: CaffeineEntry[] = history
          .map((h) => ({
            id: h.history_id.toString(),
            brand: h.brand_name,
            drink: h.menu_name,
            caffeine: h.caffeine_mg,
            timestamp: new Date(h.drinked_at),
          }))
          .sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
          );
        setEntries(todayEntries);
        setLastResetDate(new Date().toDateString());
        const newNow = new Date();
        setNow(newNow); // 데이터 로드 후 즉시 반감기 재계산
        
        // 디버깅 로그
        const calculatedIntake = calculateDecayedIntake(todayEntries, newNow);
        console.log('[CaffeineContext] Data Fetched:', {
          entriesCount: todayEntries.length,
          totalCaffeine: todayEntries.reduce((sum, e) => sum + e.caffeine, 0),
          calculatedIntake,
          dailyLimit: caffeineInfo.max_caffeine,
          timestamp: newNow.toISOString()
        });
      } catch (error) {
        console.error("Failed to load caffeine data:", error);
        resetDailyData(new Date().toDateString());
      }
    };
    fetchAndUpdateRef.current = fetchAndUpdate;
    fetchAndUpdate(); // 최초 1회
    const interval = setInterval(fetchAndUpdate, 5000); // 5초마다 fetch
    return () => clearInterval(interval);
  }, []);

  // Auto-reset at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const today = new Date().toDateString();
      if (lastResetDate && lastResetDate !== today) {
        resetDailyData(today);
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkMidnight);
  }, [lastResetDate]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const today = new Date().toDateString();
    const dataToSave = {
      date: today,
      currentIntake,
      entries,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [currentIntake, entries]);

  // Tick "now" so that 반감기 계산이 주기적으로 갱신되도록 함
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60_000); // 1분마다 갱신

    return () => clearInterval(timer);
  }, []);

  const resetDailyData = (date: string) => {
    setEntries([]);
    setLastResetDate(date);
    setHasShownHighAlert(false);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date, currentIntake: 0, entries: [] }),
    );
    localStorage.setItem(
      ALERT_SHOWN_KEY,
      JSON.stringify({ date, shown: false }),
    );
  };

  const getCaffeineStatus = (): "safe" | "caution" | "high" => {
    const percentage = (currentIntake / dailyLimit) * 100;
    if (percentage >= 75) return "high"; // 75% 이상
    if (percentage >= 50) return "caution"; // 50% 이상
    return "safe";
  };

  // addCaffeine 중복 선언 제거, 아래 버전만 남김
  const addCaffeine = async (
    entry: Omit<CaffeineEntry, "id" | "timestamp">,
  ) => {
    const projectedIntake = currentIntake + entry.caffeine;

    // 일일 권장량 초과 시 경고만 표시하고 등록은 허용
    if (projectedIntake > dailyLimit) {
      toast.warning("일일 권장량 초과 예정", {
        description: `이번 음료를 추가하면 일일 권장량(${dailyLimit}mg)을 초과합니다. 건강에 유의하세요.`,
        duration: 5000,
      });
    }

    // 1. 프론트 상태를 즉시 반영 (optimistic update)
    const newEntry: CaffeineEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setEntries((prev) => [...prev, newEntry]);
    setNow(new Date()); // 즉시 currentIntake 재계산 트리거

    // 2. 서버에 저장 및 동기화
    try {
      await caffeineAPI.addIntake({
        brand_name: entry.brand,
        menu_name: entry.drink,
        caffeine_mg: entry.caffeine,
      });
      if (fetchAndUpdateRef.current) {
        await fetchAndUpdateRef.current();
      }
      toast.success(`${entry.drink} 추가됨`, {
        description: `+${entry.caffeine}mg 카페인`,
      });
    } catch (error) {
      console.error("Failed to add caffeine:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "카페인 기록 중 오류가 발생했습니다.",
      );
    }
  };

  const remainingCaffeine = Math.max(0, dailyLimit - currentIntake);

  // fetchAndUpdate를 외부에서 쓸 수 있도록 반환값에 포함
  return (
    <CaffeineContext.Provider
      value={{
        currentIntake,
        dailyLimit,
        entries,
        addCaffeine,
        getCaffeineStatus,
        remainingCaffeine,
        hasShownHighAlert,
        fetchAndUpdate: async () => {
          if (fetchAndUpdateRef.current) {
            return await fetchAndUpdateRef.current();
          }
        },
      }}
    >
      {children}
    </CaffeineContext.Provider>
  );
}

export function useCaffeine() {
  const context = useContext(CaffeineContext);
  if (context === undefined) {
    throw new Error("useCaffeine must be used within a CaffeineProvider");
  }
  return context as CaffeineContextType & { fetchAndUpdate?: () => Promise<void> };
}
