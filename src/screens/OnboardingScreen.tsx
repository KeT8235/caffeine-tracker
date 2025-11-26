import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { SignupForm } from "@/types";
import { authAPI, setToken } from "@/lib/api";

export function OnboardingScreen({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupForm, setSignupForm] = useState<SignupForm>({
    id: "",
    password: "",
    name: "",
    birthDate: "",
    gender: "",
  });
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = value;
    if (value.length > 4) {
      formatted = `${value.slice(0, 4)}-${value.slice(4)}`;
    }
    if (value.length > 6) {
      formatted = `${formatted.slice(0, 7)}-${formatted.slice(7)}`;
    }

    setSignupForm({ ...signupForm, birthDate: formatted });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(""); // 에러 메시지 초기화

    console.log("로그인 시도:", loginForm);

    // 유효성 검사
    if (!loginForm.username || loginForm.username.length < 4) {
      setLoginError("아이디를 입력해주세요.");
      return;
    }

    if (!loginForm.password) {
      setLoginError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      // API를 통한 로그인
      const response = await authAPI.login({
        username: loginForm.username,
        password: loginForm.password,
      });

      console.log("로그인 성공:", response);

      // 토큰 저장
      setToken(response.token);

      // 사용자 정보 localStorage에 저장
      localStorage.setItem("user_profile", JSON.stringify(response.user));
      localStorage.removeItem("is_guest"); // 게스트 플래그 제거

      toast.success("로그인 성공!", {
        description: `${response.user.name}님, 환영합니다!`,
      });

      setShowLogin(false);
      onGetStarted();
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "로그인에 실패했습니다.";
      setLoginError(errorMessage); // 폼 내부에 에러 표시
    }
  };

  const handleGuestLogin = () => {
    // 게스트 사용자 정보 로컬에만 저장 (DB 저장 X)
    const guestProfile = {
      member_id: 0,
      username: "guest",
      name: "Guest",
      point: 0,
    };

    localStorage.setItem("user_profile", JSON.stringify(guestProfile));
    localStorage.setItem("is_guest", "true");

    toast.success("게스트로 로그인했습니다!", {
      description: "일부 기능이 제한될 수 있습니다.",
    });

    onGetStarted();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(""); // 에러 메시지 초기화

    console.log("회원가입 시도:", signupForm);

    // 유효성 검사
    if (!signupForm.id || signupForm.id.length < 4) {
      toast.error("아이디는 4자 이상이어야 합니다.");
      return;
    }

    if (!signupForm.password || signupForm.password.length < 6) {
      toast.error("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (!signupForm.name || signupForm.name.length < 2) {
      toast.error("이름을 올바르게 입력해주세요.");
      return;
    }

    if (!signupForm.birthDate) {
      toast.error("생년월일을 선택해주세요.");
      return;
    }

    if (!signupForm.gender) {
      toast.error("성별을 선택해주세요.");
      return;
    }

    if (
      !signupForm.weight_kg ||
      signupForm.weight_kg < 30 ||
      signupForm.weight_kg > 200
    ) {
      toast.error("몸무게를 올바르게 입력해주세요 (30-200kg).");
      return;
    }

    // 나이 계산
    const birthYear = new Date(signupForm.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age < 14) {
      toast.error("만 14세 이상부터 가입 가능합니다.");
      return;
    }

    console.log("유효성 검사 통과, API 요청 시작");

    try {
      // API를 통한 회원가입
      const response = await authAPI.signup({
        username: signupForm.id,
        password: signupForm.password,
        name: signupForm.name,
        birthDate: signupForm.birthDate,
        gender: signupForm.gender === "male" ? "남자" : "여자",
        weight_kg: signupForm.weight_kg,
      });

      console.log("회원가입 성공:", response);

      // 토큰 저장
      setToken(response.token);

      // 사용자 정보 localStorage에 저장
      localStorage.setItem("user_profile", JSON.stringify(response.user));
      localStorage.removeItem("is_guest"); // 게스트 플래그 제거

      toast.success("회원가입이 완료되었습니다!", {
        description: `${signupForm.name}님, 환영합니다!`,
      });

      setShowSignup(false);
      onGetStarted();
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다.";
      setSignupError(errorMessage); // 폼 내부에 에러 표시
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full p-6 bg-gradient-to-b from-background to-secondary/20">
      {/* Logo and Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          className="relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150" />
          <motion.div
            className="relative bg-primary rounded-full p-8"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Coffee className="w-16 h-16 text-primary-foreground" />
          </motion.div>
        </motion.div>

        <motion.div
          className="space-y-3 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-[28px] leading-tight">체내 카페인 블랙박스</h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            일일 카페인 섭취량을 모니터링하고 AI 기반 맞춤 음료추천을 받아보세요
          </p>
        </motion.div>
      </div>

      {/* CTA Buttons */}
      <motion.div
        className="w-full space-y-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90"
            onClick={() => setShowLogin(true)}
          >
            로그인
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl border-2 border-primary/20 bg-card hover:bg-secondary/30"
            onClick={() => setShowSignup(true)}
          >
            회원가입
          </Button>
        </motion.div>
      </motion.div>

      {/* Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-64 opacity-5 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary"
          animate={{ y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-32 right-16 w-32 h-32 rounded-full bg-accent"
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-20 right-32 w-16 h-16 rounded-full bg-primary"
          animate={{ y: [0, 25, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="max-w-[90%] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center">로그인</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              계정에 로그인하여 서비스를 이용하세요
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">아이디</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="아이디를 입력하세요"
                className="h-12 rounded-xl"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">비밀번호</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="h-12 rounded-xl"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 mt-6"
            >
              로그인
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signup Dialog */}
      <Dialog open={showSignup} onOpenChange={setShowSignup}>
        <DialogContent className="max-w-[90%] max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center">회원가입</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              체카블에 가입하여 맞춤형 추천을 받아보세요!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSignup} className="space-y-3 mt-3">
            <div className="space-y-1">
              <Label htmlFor="signup-id">아이디</Label>
              <Input
                id="signup-id"
                type="text"
                placeholder="아이디를 입력하세요"
                className="h-11 rounded-xl"
                value={signupForm.id}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, id: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                최소 4자 이상 입력해주세요
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="signup-password">비밀번호</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="h-11 rounded-xl"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, password: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                최소 6자 이상 입력해주세요
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="signup-name">이름</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="이름을 입력하세요"
                className="h-11 rounded-xl"
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, name: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                최소 2자 이상 입력해주세요
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="signup-birthdate">생년월일</Label>
              <Input
                id="signup-birthdate"
                type="text"
                inputMode="numeric"
                placeholder="생년월일 8자리 (예: 19901231)"
                className="h-11 rounded-xl"
                value={signupForm.birthDate}
                onChange={handleBirthDateChange}
                maxLength={10}
                required
              />
              <p className="text-xs text-gray-500">
                만 14세 이상만 가입 가능합니다
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="signup-gender">성별</Label>
              <Select
                value={signupForm.gender}
                onValueChange={(value: "male" | "female") =>
                  setSignupForm({ ...signupForm, gender: value })
                }
              >
                <SelectTrigger className="h-11 rounded-xl" id="signup-gender">
                  <SelectValue placeholder="성별을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남자</SelectItem>
                  <SelectItem value="female">여자</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                카페인 권장량 계산에 사용됩니다
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="signup-weight">몸무게</Label>
              <Input
                id="signup-weight"
                type="number"
                placeholder="몸무게를 입력하세요 (kg)"
                className="h-11 rounded-xl"
                value={signupForm.weight_kg || ""}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    weight_kg: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                min="30"
                max="200"
                required
              />
              <p className="text-xs text-gray-500">
                카페인 권장량 계산에 사용됩니다 (30-200kg)
              </p>
            </div>

            {signupError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {signupError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 mt-4"
            >
              가입하기
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
