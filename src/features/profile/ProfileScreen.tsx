import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  User,
  Weight,
  Ruler,
  Calendar,
  Zap,
  Bell,
  Globe,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useAlertSetting } from "@/contexts/AlertContext";
import { profileAPI, removeToken } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export function ProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
    // 알림 스위치 Context 사용
    const { alertsEnabled, setAlertsEnabled } = useAlertSetting();
    const handleAlertsToggle = (checked: boolean) => {
      setAlertsEnabled(checked);
      if (checked) {
        toast.success(t("alertsOn"), { dismissible: true });
      } else {
        toast.success(t("alertsOff"), { dismissible: true });
      }
    };
    // 알림이 꺼져 있으면 toast를 띄우지 않는 래퍼
    const safeToast = {
      success: (msg: string) => alertsEnabled && toast.success(msg, { dismissible: true }),
      error: (msg: string) => alertsEnabled && toast.error(msg, { dismissible: true }),
    };
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [languageCode, setLanguageCode] = useState<string>("ko");
  const [editForm, setEditForm] = useState({
    weight: "",
    gender: "",
    birthDate: "",
  });
  const recommendedLimit = 400; // WHO recommended limit
  const [limitValue, setLimitValue] = useState<number>(recommendedLimit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileAPI.getProfile();
        setProfile(data);
        
        // DB에서 프로필 사진 불러오기
        if (data.profile_photo) {
          setProfileImage(data.profile_photo);
        }
        
        // 언어 코드 불러오기
        if (data.language_code) {
          setLanguageCode(data.language_code);
        }

        if (data.caffeineInfo?.max_caffeine) {
          setLimitValue(data.caffeineInfo.max_caffeine);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        safeToast.error(t("profile.profileLoadFailed"));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        safeToast.error(t('profile.imageOnly'));
        return;
      }

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        safeToast.error(t('profile.imageSizeLimit'));
        return;
      }

      // 이미지 리사이즈 및 압축
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = async () => {
        // Canvas를 사용하여 이미지 리사이즈
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 최대 크기 설정 (400x400)
        const maxSize = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // JPEG로 압축 (품질 0.7)
        const base64String = canvas.toDataURL('image/jpeg', 0.7);
        setProfileImage(base64String);
        
        // DB에 저장
        try {
          await profileAPI.updateProfile({ profile_photo: base64String });
          
          // 프로필 다시 로드하여 동기화
          const refreshedProfile = await profileAPI.getProfile();
          setProfile(refreshedProfile);
          
          // localStorage 업데이트
          updateLocalStorageProfile({ profile_photo: base64String });
          
          safeToast.success(t('profile.photoSaved'));
        } catch (error) {
          console.error('Failed to save profile photo:', error);
          safeToast.error(t('profile.photoSaveFailed'));
          setProfileImage(null);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // localStorage 프로필 업데이트 헬퍼 함수
  const updateLocalStorageProfile = (updatedProfile: any) => {
    const currentProfile = localStorage.getItem("user_profile");
    if (currentProfile) {
      try {
        const profile = JSON.parse(currentProfile);
        const newProfile = { ...profile, ...updatedProfile };
        localStorage.setItem("user_profile", JSON.stringify(newProfile));
      } catch (error) {
        console.error("Failed to update localStorage profile:", error);
      }
    }
  };

  const handleLogoutClick = () => {
    removeToken();
    localStorage.removeItem("user_profile");
    onLogout();
  };

  const handleEditProfileClick = () => {
    if (profile && profile.caffeineInfo) {
      // age(DATE 타입)를 YYYY-MM-DD 형식으로 변환
      let birthDateStr = "";
      if (profile.caffeineInfo.age) {
        try {
          const date = new Date(profile.caffeineInfo.age);
          if (!isNaN(date.getTime())) {
            birthDateStr = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn("Invalid age date:", profile.caffeineInfo.age);
        }
      }

      setEditForm({
        weight: profile.caffeineInfo.weight_kg?.toString() || "",
        gender: profile.caffeineInfo.gender || "",
        birthDate: birthDateStr,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // 유효성 검사
      if (!editForm.weight || !editForm.gender || !editForm.birthDate) {
        safeToast.error(t("profile.allFieldsRequired"));
        return;
      }

      const weight = parseFloat(editForm.weight);
      
      if (isNaN(weight) || weight <= 0) {
        safeToast.error(t("profile.invalidWeight"));
        return;
      }

      // 성별을 DB 형식으로 변환 (M -> 남자, F -> 여자)
      const genderMap: { [key: string]: string } = {
        'M': '남자',
        'F': '여자',
      };

      const updatedData = {
        weight_kg: weight,
        gender: genderMap[editForm.gender] || editForm.gender,
        age: editForm.birthDate, // DATE 타입으로 생년월일 전송
      };

      await profileAPI.updateProfile(updatedData);
      
      // 프로필 다시 로드
      const refreshedProfile = await profileAPI.getProfile();
      setProfile(refreshedProfile);
      
      // localStorage 업데이트
      updateLocalStorageProfile(updatedData);
      
      setIsEditDialogOpen(false);
      safeToast.success(t("profile.profileUpdated"));
    } catch (error) {
      console.error("Failed to update profile:", error);
      safeToast.error(t("profile.profileUpdateFailed"));
    }
  };

  const handleLanguageChange = async (newLanguageCode: string) => {
    try {
      await profileAPI.updateProfile({ language_code: newLanguageCode });
      setLanguageCode(newLanguageCode);
      
      // 프로필 다시 로드
      const refreshedProfile = await profileAPI.getProfile();
      setProfile(refreshedProfile);
      
      // localStorage 업데이트
      updateLocalStorageProfile({ language_code: newLanguageCode });
      
      setIsLanguageDialogOpen(false);
      i18n.changeLanguage(newLanguageCode);
      safeToast.success(t("profile.languageChanged"));
    } catch (error) {
      console.error("Failed to update language:", error);
      safeToast.error(t("profile.languageChangeFailed"));
    }
  };

  const handleOpenLimitDialog = () => {
    setLimitValue(profile.caffeineInfo?.max_caffeine || recommendedLimit);
    setIsLimitDialogOpen(true);
  };

  const handleSaveLimit = async () => {
    if (!limitValue || limitValue < 100) {
      safeToast.error("최소 100mg 이상의 값을 입력해주세요.");
      return;
    }

    // 600mg 초과 시 경고 다이얼로그 표시
    if (limitValue > 600) {
      setIsLimitDialogOpen(false);
      setIsWarningDialogOpen(true);
      return;
    }

    // 정상 범위내 저장
    await saveLimitValue();
  };

  const saveLimitValue = async () => {
    try {
      await profileAPI.updateProfile({ max_caffeine: limitValue });
      const refreshedProfile = await profileAPI.getProfile();
      setProfile(refreshedProfile);
      
      // localStorage 업데이트
      updateLocalStorageProfile({ max_caffeine: limitValue });
      
      setIsLimitDialogOpen(false);
      setIsWarningDialogOpen(false);
      safeToast.success(t("profile.limitUpdated"));
    } catch (error) {
      console.error("Failed to update limit:", error);
      safeToast.error(t("profile.profileUpdateFailed"));
    }
  };

  const handleConfirmHighLimit = async () => {
    await saveLimitValue();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          {t("profile.profileNotFound")}
        </p>
      </div>
    );
  }

  const dailyLimit = profile.caffeineInfo?.max_caffeine || 400;
  const weight = profile.caffeineInfo?.weight_kg || 0;
  const birthDate = profile.caffeineInfo?.age
    ? new Date(profile.caffeineInfo.age)
    : null;
  const age = birthDate
    ? new Date().getFullYear() - birthDate.getFullYear()
    : 0;
  const initials = profile.name.substring(0, 2).toUpperCase();
  
  const languageNames: { [key: string]: string } = {
    ko: t("language.korean"),
    en: t("language.english"),
    ja: t("language.japanese"),
    zh: t("language.chinese"),
  };

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

          <h1 className="text-[24px]">{t("profile.title")}</h1>

          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/10">
            <div className="flex items-start space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 cursor-pointer relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleImageClick}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-foreground text-[22px]">
                    {initials}
                  </span>
                )}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[22px] mb-1 truncate">{profile.name}</h2>
                <p className="text-sm text-muted-foreground truncate mb-3">
                  {profile.username}
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl border-primary/20 text-sm"
                    onClick={handleEditProfileClick}
                  >
                    {t("profile.editProfile")}
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Health Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="mb-3 text-[18px]">{t("profile.healthInfo")}</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="p-4 bg-card">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-xl p-2">
                    <Weight className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.weight")}</p>
                    <p className="text-[18px]">
                      {weight > 0 ? `${Math.round(weight)} ${t("profile.kg")}` : "-"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="p-4 bg-card">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-xl p-2">
                    <Ruler className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.gender")}</p>
                    <p className="text-[18px]">
                      {profile.caffeineInfo?.gender === "남자" ? t("profile.male") : profile.caffeineInfo?.gender === "여자" ? t("profile.female") : "-"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="p-4 bg-card">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-xl p-2">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.age")}</p>
                    <p className="text-[18px]">
                      {age > 0 ? `${age} ${t("profile.years")}` : "-"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="p-4 bg-card">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-xl p-2">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.dailyLimit")}</p>
                    <p className="text-[18px]">{dailyLimit} {t("profile.mg")}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Caffeine Limit Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-4 mt-3 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      {t("profile.limitComparison")}
                    </span>
                  </div>
                </div>

                {/* Visual Bar Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("profile.yourLimit")}</span>
                    <span className="text-primary">{dailyLimit}{t("profile.mg")}</span>
                  </div>
                  <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(dailyLimit / recommendedLimit) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t("profile.whoRecommended")}
                    </span>
                    <span>{recommendedLimit}{t("profile.mg")}</span>
                  </div>
                  <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/40 rounded-full w-full" />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("profile.limitPercentage", { percent: ((dailyLimit / recommendedLimit) * 100).toFixed(0) })}
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="mb-3 text-[18px]">{t("profile.settings")}</h3>
          <Card className="divide-y divide-border/50">
            {/* Caffeine Alerts */}
            <motion.div
              className="p-4 flex items-center justify-between"
              whileHover={{ backgroundColor: "rgba(230, 213, 195, 0.1)" }}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-xl p-2">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="alerts" className="cursor-pointer">
                    {t("profile.caffeineAlerts")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("profile.caffeineAlertsDesc")}
                  </p>
                </div>
              </div>
              <Switch id="alerts" checked={alertsEnabled} onCheckedChange={handleAlertsToggle} />
            </motion.div>

            {/* Language */}
            <motion.div
              className="p-4 flex items-center justify-between cursor-pointer"
              whileHover={{ backgroundColor: "rgba(230, 213, 195, 0.1)", x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLanguageDialogOpen(true)}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-accent/20 rounded-xl p-2">
                  <Globe className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p>{t("profile.language")}</p>
                  <p className="text-xs text-muted-foreground">{languageNames[languageCode]}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>

            {/* Edit Daily Limit */}
            <motion.div
              className="p-4 flex items-center justify-between cursor-pointer"
              whileHover={{ backgroundColor: "rgba(230, 213, 195, 0.1)", x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenLimitDialog}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-xl p-2">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p>{t("profile.dailyCaffeineLimit")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("profile.dailyCaffeineLimitDesc")}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>

            {/* Edit Profile Info */}
            <motion.div
              className="p-4 flex items-center justify-between cursor-pointer"
              whileHover={{ backgroundColor: "rgba(230, 213, 195, 0.1)", x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEditProfileClick}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-xl p-2">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p>{t("profile.personalInfo")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("profile.personalInfoDesc")}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="mb-3 text-[18px]">{t("profile.account")}</h3>
          <Card>
            <motion.div
              whileHover={{ backgroundColor: "rgba(212, 24, 61, 0.05)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                className="w-full h-14 rounded-xl justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogoutClick}
              >
                <LogOut className="w-5 h-5 mr-3" />
                {t("auth.logout")}
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          className="text-center py-4 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <p>AI Caffeine Advisor</p>
          <p>Version 1.0.0</p>
        </motion.div>

        <div className="h-6" />
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("profile.editProfileTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="weight">{t("profile.weightLabel")}</Label>
              <Input
                id="weight"
                type="number"
                value={editForm.weight}
                onChange={(e) =>
                  setEditForm({ ...editForm, weight: e.target.value })
                }
                placeholder={t("profile.weightPlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">{t("profile.genderLabel")}</Label>
              <Select
                value={editForm.gender}
                onValueChange={(value: string) =>
                  setEditForm({ ...editForm, gender: value })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder={t("profile.genderPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">{t("profile.male")}</SelectItem>
                  <SelectItem value="F">{t("profile.female")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthDate">{t("profile.birthDateLabel")}</Label>
              <Input
                id="birthDate"
                type="date"
                value={editForm.birthDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, birthDate: e.target.value })
                }
                placeholder={t("profile.birthDatePlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveProfile}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Selection Dialog */}
      <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="text-center">{t("language.selectLanguage")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {[
              { code: "ko", name: t("language.korean"), flag: "🇰🇷" },
              { code: "en", name: t("language.english"), flag: "🇺🇸" },
              { code: "ja", name: t("language.japanese"), flag: "🇯🇵" },
              { code: "zh", name: t("language.chinese"), flag: "🇨🇳" },
            ].map((lang) => (
              <motion.div
                key={lang.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    languageCode === lang.code
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-accent/5"
                  }`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-[16px]">{lang.name}</span>
                    </div>
                    {languageCode === lang.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Limit Dialog */}
      <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("profile.limitDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dailyLimitInput">{t("profile.dailyCaffeineLimit")}</Label>
              <Input
                id="dailyLimitInput"
                type="number"
                min={100}
                max={9999}
                step={10}
                value={limitValue}
                onChange={(e) => setLimitValue(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t("profile.limitDialogDescription")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("profile.limitDialogHelper")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLimitDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveLimit}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog for High Limit */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              경고: 과도한 제한량
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <p className="text-sm">
                설정하려는 제한량 <span className="font-bold text-red-500">{limitValue}mg</span>은 일반적인 권장 범위(100-600mg)를 초과합니다.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium mb-2">해당 설정 시 다음이 제한될 수 있습니다:</p>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>챌린지 기능이 정상적으로 작동하지 않을 수 있습니다</li>
                  <li>건강 경고 알림이 부정확할 수 있습니다</li>
                  <li>과도한 카페인 섭취는 건강에 해로울 수 있습니다</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                그래도 설정하시겠습니까?
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsWarningDialogOpen(false);
                setIsLimitDialogOpen(true);
              }}
            >
              취소
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmHighLimit}
            >
              알겠습니다. 설정하겠습니다
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
