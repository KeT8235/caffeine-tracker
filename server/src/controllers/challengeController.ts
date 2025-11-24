import { Request, Response } from "express";
import pool from "../config/database.js";

// 진행 상태 타입
type ChallengeStatus = "not started" | "in progress" | "claimable" | "completed" | "locked";

// 챌린지 목록 조회 (자동 진행 계산)
export const getChallenges = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user?.memberId;

    if (!memberId) {
      return res.status(401).json({ error: "인증 정보가 없습니다." });
    }

    // 1) 챌린지 정의 조회
    const [rows] = await pool.query(
      `SELECT challenge_id, challenge_code, title, description, target_type, target_value
       FROM challenge_definitions
       ORDER BY challenge_code ASC`,
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.json([]);
    }

    const definitions = rows as Array<{
      challenge_id: number;
      challenge_code: number;
      title: string;
      description: string;
      target_type: "DAILY" | "STREAK" | "CUMULATIVE";
      target_value: number;
    }>;

    // 2) 오늘 날짜/최근 날짜 정보 준비
    const today = new Date();
    const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);
    const todayStr = toDateOnly(today); // YYYY-MM-DD

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    const twoDaysAgoStr = toDateOnly(twoDaysAgo);

    // 3) 오늘 섭취 이력 + 카테고리 정보 (디카페인/일반)
    const [todayHistoryRows] = await pool.query(
      `SELECT ch.history_id,
              ch.caffeine_mg,
              ch.drinked_at,
              ch.menu_name,
              ch.brand_name,
              m.category
         FROM caffeine_history ch
         LEFT JOIN menu m ON ch.menu_id = m.menu_id
        WHERE ch.member_id = ?
          AND DATE(ch.drinked_at) = CURDATE()
        ORDER BY ch.drinked_at ASC`,
      [memberId],
    );

    const todayHistory = (todayHistoryRows as any[]) || [];

    // 4) 오늘 총 카페인 / 디카페인 여부 등 계산
    const totalTodayCaffeine = todayHistory.reduce(
      (sum, row) => sum + (row.caffeine_mg || 0),
      0,
    );
    // 디카페인 판단: menu.category='decaf' 또는 menu_id가 null이고 caffeine_mg < 20
    const hasTodayDecaf = todayHistory.some((row) => {
      if (row.category === "decaf") return true;
      // menu_id가 null인 경우 카페인 함량으로 판단 (20mg 미만이면 디카페인으로 간주)
      if (!row.category && row.caffeine_mg < 20) return true;
      return false;
    });
    // 최근 24시간 섭취량 계산 (챌린지 3번용)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [last24HoursRows] = await pool.query(
      `SELECT SUM(caffeine_mg) AS total_caffeine
         FROM caffeine_history
        WHERE member_id = ?
          AND drinked_at >= ?
        GROUP BY member_id`,
      [memberId, twentyFourHoursAgo.toISOString().slice(0, 19).replace('T', ' ')],
    );

    let last24HoursCaffeine = 0;
    if (Array.isArray(last24HoursRows) && last24HoursRows.length > 0) {
      const row = last24HoursRows[0] as any;
      last24HoursCaffeine = Number(row.total_caffeine || 0);
    }

    // 5) 사용자 최대 권장량 조회 (members_caffeine)
    const [caffeineInfoRows] = await pool.query(
      `SELECT max_caffeine
         FROM members_caffeine
        WHERE member_id = ?`,
      [memberId],
    );

    let maxCaffeine = 400; // 기본값
    let isChallengesLocked = false; // 챌린지 잠금 여부
    if (Array.isArray(caffeineInfoRows) && caffeineInfoRows.length > 0) {
      const info = caffeineInfoRows[0] as any;
      if (info.max_caffeine) {
        maxCaffeine = Number(info.max_caffeine);
        // 카페인 제한이 600mg 초과 시 챌린지 잠금
        isChallengesLocked = maxCaffeine > 600;
      }
    }

    // 6) 최근 3일(오늘 포함) 일일 섭취량
    const [last3DaysRows] = await pool.query(
      `SELECT DATE(drinked_at) AS date,
              SUM(caffeine_mg) AS total_caffeine
         FROM caffeine_history
        WHERE member_id = ?
          AND DATE(drinked_at) BETWEEN ? AND ?
        GROUP BY DATE(drinked_at)`,
      [memberId, twoDaysAgoStr, todayStr],
    );

    const last3DaysMap = new Map<string, number>();
    if (Array.isArray(last3DaysRows)) {
      (last3DaysRows as any[]).forEach((row) => {
        last3DaysMap.set(row.date, Number(row.total_caffeine || 0));
      });
    }

    // 7) 전체 출석일(기록이 있는 날짜 수)
    const [attendanceRows] = await pool.query(
      `SELECT COUNT(DISTINCT DATE(drinked_at)) AS days_with_intake
         FROM caffeine_history
        WHERE member_id = ?`,
      [memberId],
    );

    let daysWithIntake = 0;
    if (Array.isArray(attendanceRows) && attendanceRows.length > 0) {
      const row = attendanceRows[0] as any;
      daysWithIntake = Number(row.days_with_intake || 0);
    }

    // 8) 이미 완료 처리된 챌린지 조회 (일일 미션은 오늘 날짜 기준)
    const [claimedRows] = await pool.query(
      `SELECT ucp.challenge_code, cd.target_type
         FROM user_challenge_progress ucp
         JOIN challenge_definitions cd ON ucp.challenge_code = cd.challenge_code
        WHERE ucp.member_id = ?
          AND ucp.is_completed = 1
          AND ucp.claimed_at IS NOT NULL
          AND (
            cd.target_type IN ('CUMULATIVE', 'STREAK')
            OR (cd.target_type = 'DAILY' AND DATE(ucp.claimed_at) = CURDATE())
          )`,
      [memberId],
    );

    const claimedChallenges = new Set<number>();
    if (Array.isArray(claimedRows)) {
      (claimedRows as any[]).forEach((row) => {
        claimedChallenges.add(Number(row.challenge_code));
      });
    }

    // 9) 챌린지 3번(70% 제한 유지) 전용 데이터 조회
    const [startTimeRows] = await pool.query(
      `SELECT MIN(drinked_at) AS start_time
         FROM caffeine_history
        WHERE member_id = ?`,
      [memberId],
    );

    let challenge3StartTime: Date | null = null;
    if (Array.isArray(startTimeRows) && startTimeRows.length > 0) {
      const row = startTimeRows[0] as any;
      challenge3StartTime = row.start_time ? new Date(row.start_time) : null;
    }

    let challenge3ElapsedHours = 0;
    let challenge3HasViolation = false;

    if (challenge3StartTime) {
      challenge3ElapsedHours = (now.getTime() - challenge3StartTime.getTime()) / (1000 * 60 * 60);
      
      const limit70 = maxCaffeine * 0.7;
      const [violationRows] = await pool.query(
        `SELECT COUNT(*) AS violation_count
           FROM (
             SELECT DATE(drinked_at) AS date, SUM(caffeine_mg) AS daily_total
               FROM caffeine_history
              WHERE member_id = ?
                AND drinked_at >= ?
              GROUP BY DATE(drinked_at)
             HAVING daily_total > ?
           ) AS violations`,
        [memberId, twentyFourHoursAgo.toISOString().slice(0, 19).replace('T', ' '), limit70],
      );

      if (Array.isArray(violationRows) && violationRows.length > 0) {
        const row = violationRows[0] as any;
        challenge3HasViolation = Number(row.violation_count || 0) > 0;
      }
    }

    // 10) 챌린지별 자동 진행 계산
    const iconMap: Record<number, string> = {
      1: "☕",
      2: "📉",
      3: "🌙",
      4: "🍵",
      5: "🎯",
      6: "🏅",
    };

    const rewardMap: Record<number, string> = {
      1: "디카페인 마스터 배지 ✨",
      2: "감량 챔피언 배지 🎖️",
      3: "건강 수호자 배지 🛡️",
      4: "권장량 달성 배지 🏆",
      5: "첫 걸음 배지 👣",
      6: "꾸준함의 달인 배지 🌟",
    };

    const goalMap: Record<number, string> = {
      1: "오늘 디카페인 음료 1잔 이상 마시기",
      2: "카페인 섭취량 50% 감량하기",
      3: "24시간 동안 권장량의 70% 이하 유지하기",
      4: "3일 권장량 이하로 섭취하기",
      5: "1회 출석하기 (카페인 기록 남기기)",
      6: "10일 출석하기 (카페인 기록 남기기)",
    };

    const challenges = definitions.map((def) => {
      let status: ChallengeStatus = "not started";
      let progress: number | undefined;

      switch (def.challenge_code) {
        case 1: {
          // 디카페인 대체 챌린지: 오늘 디카페인 음료 1회 이상 섭취
          const success = hasTodayDecaf;
          status = success ? "claimable" : "not started";
          progress = success ? 100 : 0;
          break;
        }
        case 3: {
          // 70% 제한 유지: 24시간 동안 한 번도 70%를 초과하지 않아야 성공
          if (!challenge3StartTime) {
            // 아직 기록이 없으면 시작 전
            status = "not started";
            progress = 0;
          } else {
            const progressRatio = Math.min(challenge3ElapsedHours / 24, 1);

            if (challenge3ElapsedHours >= 24 && !challenge3HasViolation) {
              // 24시간 경과 + 위반 없음 = 성공
              status = "claimable";
              progress = 100;
            } else if (challenge3HasViolation) {
              // 위반 발생 = 실패 (다시 시작해야 함)
              status = "not started";
              progress = 0;
            } else {
              // 진행 중 (24시간 미만 + 위반 없음)
              status = "in progress";
              progress = Math.round(progressRatio * 100);
            }
          }
          break;
        }
        case 4: {
          // 3일 연속 권장량 달성: 최근 3일 모두 max_caffeine 이하
          const dates = [
            toDateOnly(twoDaysAgo),
            toDateOnly(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
            todayStr,
          ];
          let successDays = 0;
          dates.forEach((d) => {
            const total = last3DaysMap.get(d) || 0;
            if (total > 0 && total <= maxCaffeine) {
              successDays += 1;
            }
          });

          if (successDays === 0) {
            status = "not started";
            progress = 0;
          } else if (successDays >= 3) {
            status = "claimable";
            progress = 100;
          } else {
            status = "in progress";
            progress = Math.round((successDays / 3) * 100);
          }
          break;
        }
        case 5: {
          // 1회 출석하기 (DAILY): 오늘 카페인 기록이 있으면 완료
          const hasTodayRecord = todayHistory.length > 0;
          if (hasTodayRecord) {
            status = "claimable";
            progress = 100;
          } else {
            status = "not started";
            progress = 0;
          }
          break;
        }
        case 6: {
          // 10회 출석체크: 기록이 있는 날 누적 10일 달성
          const target = def.target_value || 10;
          const ratio = Math.min(daysWithIntake / target, 1);
          if (daysWithIntake === 0) {
            status = "not started";
            progress = 0;
          } else if (daysWithIntake >= target) {
            status = "claimable";
            progress = 100;
          } else {
            status = "in progress";
            progress = Math.round(ratio * 100);
          }
          break;
        }
        default: {
          // 기타 챌린지: 기본값 유지
          status = "not started";
          progress = 0;
          break;
        }
      }

      // 이미 완료한 챌린지는 completed 상태로 설정
      if (claimedChallenges.has(def.challenge_code)) {
        status = "completed";
        progress = 100;
      }

      // 카페인 제한이 600mg 초과면 완료되지 않은 모든 챌린지를 잠금 상태로 변경
      if (isChallengesLocked && status !== "completed") {
        status = "locked" as ChallengeStatus;
      }

      return {
        challenge_id: def.challenge_id,
        challenge_code: def.challenge_code,
        title: def.title,
        goal: goalMap[def.challenge_code] || def.description || "",
        description: def.description || "",
        target_type: def.target_type,
        target_value: def.target_value,
        status,
        progress,
        daysLeft: undefined,
        reward: rewardMap[def.challenge_code] || "배지 획득 🎁",
        icon: iconMap[def.challenge_code] || "🎯",
      };
    });

    // 사용자의 현재 포인트 조회
    const [memberRows] = await pool.query(
      `SELECT point FROM members WHERE member_id = ?`,
      [memberId],
    );

    let currentPoints = 0;
    if (Array.isArray(memberRows) && memberRows.length > 0) {
      const member = memberRows[0] as any;
      currentPoints = Number(member.point || 0);
    }

    res.json({
      challenges,
      currentPoints,
    });
  } catch (error) {
    console.error("Get challenges error:", error);
    res.status(500).json({ error: "챌린지 목록 조회 중 오류가 발생했습니다." });
  }
};

// 챌린지 완료 처리 (보상 수령)
export const claimChallenge = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const memberId = (req as any).user?.memberId;
    const { challengeCode } = req.params;

    if (!memberId) {
      return res.status(401).json({ error: "인증 정보가 없습니다." });
    }

    const code = parseInt(challengeCode);
    if (isNaN(code)) {
      return res.status(400).json({ error: "잘못된 챌린지 코드입니다." });
    }

    await connection.beginTransaction();

    // 1) 챌린지 타입 확인
    const [challengeRows] = await connection.query(
      `SELECT target_type FROM challenge_definitions WHERE challenge_code = ?`,
      [code],
    );

    if (!Array.isArray(challengeRows) || challengeRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "챌린지를 찾을 수 없습니다." });
    }

    const challengeDef = challengeRows[0] as any;
    const targetType = challengeDef.target_type;

    // 2) 포인트 계산 (일일 미션: 1pt, 장기 미션: 5pt)
    const pointsToAdd = targetType === "DAILY" ? 1 : 5;

    // 3) 이미 오늘 완료한 챌린지인지 확인 (일일 미션의 경우)
    if (targetType === "DAILY") {
      const [existingRows] = await connection.query(
        `SELECT * FROM user_challenge_progress
         WHERE member_id = ?
           AND challenge_code = ?
           AND DATE(claimed_at) = CURDATE()
           AND is_completed = 1`,
        [memberId, code],
      );

      if (Array.isArray(existingRows) && existingRows.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: "이미 오늘 완료한 챌린지입니다." });
      }
    } else {
      // 장기 미션의 경우 이미 완료했는지 확인
      const [existingRows] = await connection.query(
        `SELECT * FROM user_challenge_progress
         WHERE member_id = ?
           AND challenge_code = ?
           AND is_completed = 1`,
        [memberId, code],
      );

      if (Array.isArray(existingRows) && existingRows.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: "이미 완료한 챌린지입니다." });
      }
    }

    // 4) user_challenge_progress에 완료 기록 추가
    await connection.query(
      `INSERT INTO user_challenge_progress 
       (member_id, challenge_code, progress_date, is_completed, claimed_at)
       VALUES (?, ?, CURDATE(), 1, NOW())
       ON DUPLICATE KEY UPDATE
       is_completed = 1,
       claimed_at = NOW()`,
      [memberId, code],
    );

    // 5) members 테이블의 포인트 업데이트
    await connection.query(
      `UPDATE members SET point = point + ? WHERE member_id = ?`,
      [pointsToAdd, memberId],
    );

    await connection.commit();

    res.json({
      message: "챌린지 완료 처리되었습니다.",
      challenge_code: code,
      points_earned: pointsToAdd,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Claim challenge error:", error);
    res.status(500).json({ error: "챌린지 완료 처리 중 오류가 발생했습니다." });
  } finally {
    connection.release();
  }
};
