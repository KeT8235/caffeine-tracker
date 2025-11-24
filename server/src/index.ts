// 서버 시작 시 DB 마이그레이션 자동 실행
// ⚠️ 마이그레이션은 수동으로 실행하세요: npm run migrate-all
// ES 모듈 환경에서는 require()를 사용할 수 없으므로 자동 실행을 비활성화했습니다.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "@/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // 프로필 사진 업로드를 위해 limit 증가
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 라우트
app.use("/api", routes);

// 헬스 체크
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Caffeine Advisor API is running" });
});

// 에러 핸들링
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  },
);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
});
