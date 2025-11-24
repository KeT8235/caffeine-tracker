import { motion } from "motion/react";
import { useCaffeine } from "@/contexts/CaffeineContext";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

export function CaffeineStatusBar() {
  const { currentIntake, dailyLimit, getCaffeineStatus } = useCaffeine();
  const percentage = (currentIntake / dailyLimit) * 100;
  const status = getCaffeineStatus();

  const statusConfig = {
    safe: {
      icon: Shield,
      label: "안전",
      color: "#22c55e",
      gradient: "from-green-500/20 to-green-500/5",
    },
    caution: {
      icon: AlertTriangle,
      label: "주의",
      color: "#eab308",
      gradient: "from-yellow-500/20 to-yellow-500/5",
    },
    high: {
      icon: AlertCircle,
      label: "높음",
      color: "#ef4444",
      gradient: "from-red-500/20 to-red-500/5",
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <motion.div
      className={`p-4 rounded-2xl bg-gradient-to-r ${currentStatus.gradient} border border-${status === "safe" ? "green" : status === "caution" ? "yellow" : "red"}-500/20`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon
            style={{ color: currentStatus.color }}
            className="w-5 h-5"
          />
          <span className="text-sm" style={{ color: currentStatus.color }}>
            {currentStatus.label}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentIntake} / {dailyLimit} mg
        </span>
      </div>
      <div className="relative h-2 bg-secondary/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: currentStatus.color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
