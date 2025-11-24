import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export type StatusType = "safe" | "caution" | "high";

interface StatusCardProps {
  status: StatusType;
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  safe: "bg-green-500/10 border-green-500/20 text-green-500",
  caution: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  high: "bg-red-500/10 border-red-500/20 text-red-500",
};

export function StatusCard({
  status,
  icon: Icon,
  label,
  children,
  className = "",
}: StatusCardProps) {
  const statusStyle = statusStyles[status];

  return (
    <Card
      className={`border-2 transition-all duration-200 ${statusStyle} ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${statusStyle.split(" ")[0]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">상태</p>
            <p className="text-lg font-semibold">{label}</p>
          </div>
        </div>
        {children}
      </div>
    </Card>
  );
}
