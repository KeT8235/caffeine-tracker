import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface CaffeineAlertProps {
  open: boolean;
  onClose: () => void;
}

export function CaffeineAlert({ open, onClose }: CaffeineAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[340px] rounded-3xl">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-accent/20 rounded-full p-4">
              <AlertTriangle className="w-12 h-12 text-accent-foreground" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-[22px]">
            Approaching Daily Limit
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[15px] leading-relaxed">
            You are close to your daily caffeine limit. Consider a decaf option
            or wait a few hours before your next drink.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-col sm:space-x-0 gap-2">
          <AlertDialogAction className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90">
            Got it, thanks!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
