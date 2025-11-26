import { Request, Response } from "express";
import pool from "../config/database.js";
import type { AddCaffeineRequest } from "../types/index.js";

// 카페인 기록 개별 삭제
export const deleteCaffeineHistory = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;
    const { historyId } = req.params;
    // 삭제할 기록의 caffeine_mg 조회
    const [rows] = await pool.query(
      'SELECT caffeine_mg FROM caffeine_history WHERE history_id = ? AND member_id = ?',
      [historyId, memberId],
    ) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: '기록을 찾을 수 없습니다.' });
    }
    const caffeineMg = (rows[0] as { caffeine_mg: number }).caffeine_mg;
    // 기록 삭제
    await pool.query(
      'DELETE FROM caffeine_history WHERE history_id = ? AND member_id = ?',
      [historyId, memberId],
    );
    // current_caffeine 차감 (음수 방지)
    await pool.query(
      'UPDATE members_caffeine SET current_caffeine = GREATEST(current_caffeine - ?, 0), updated_at = NOW() WHERE member_id = ?',
      [caffeineMg, memberId],
    );
    res.json({ message: '기록이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete caffeine history error:', error);
    res.status(500).json({ error: '기록 삭제 중 오류가 발생했습니다.' });
  }
};

// 오늘의 카페인 기록 전체 삭제
export const deleteTodayCaffeine = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;
    await pool.query(
      'DELETE FROM caffeine_history WHERE member_id = ? AND DATE(drinked_at) = CURDATE()',
      [memberId],
    );
    // current_caffeine도 0으로 초기화
    await pool.query(
      'UPDATE members_caffeine SET current_caffeine = 0, updated_at = NOW() WHERE member_id = ?',
      [memberId],
    );
    res.json({ message: '오늘의 기록이 모두 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete today caffeine error:', error);
    res.status(500).json({ error: '오늘 기록 전체 삭제 중 오류가 발생했습니다.' });
  }
};


// 카페인 섭취 기록 추가
export const addCaffeineIntake = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;
    const { menu_id, brand_name, menu_name, caffeine_mg, temp }: AddCaffeineRequest = req.body;

    if (!brand_name || !menu_name || !caffeine_mg) {
      return res.status(400).json({ error: "필수 정보를 입력해주세요." });
    }

    // 섭취 기록 저장
    await pool.query(
      `INSERT INTO caffeine_history 
       (member_id, menu_id, brand_name, menu_name, caffeine_mg, temp, drinked_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [memberId, menu_id || null, brand_name, menu_name, caffeine_mg, temp || null],
    );

    // 현재 누적 카페인 업데이트
    await pool.query(
      `UPDATE members_caffeine 
       SET current_caffeine = current_caffeine + ?, 
           updated_at = NOW() 
       WHERE member_id = ?`,
      [caffeine_mg, memberId],
    );

    // 업데이트된 카페인 정보 조회
    const [caffeineInfo] = await pool.query(
      "SELECT current_caffeine, max_caffeine FROM members_caffeine WHERE member_id = ?",
      [memberId],
    );

    res.json({
      message: "카페인 섭취가 기록되었습니다.",
      caffeineInfo: Array.isArray(caffeineInfo) ? caffeineInfo[0] : null,
    });
  } catch (error) {
    console.error("Add caffeine error:", error);
    res.status(500).json({ error: "카페인 기록 중 오류가 발생했습니다." });
  }
};

// 오늘의 카페인 섭취 이력 조회
export const getTodayHistory = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;

    const [history] = await pool.query(
      `SELECT ch.*, m.menu_photo 
       FROM caffeine_history ch
       LEFT JOIN menu m ON ch.menu_id = m.menu_id
       WHERE ch.member_id = ? 
       AND DATE(ch.drinked_at) = CURDATE() 
       ORDER BY ch.drinked_at DESC`,
      [memberId],
    );

    res.json(history);
  } catch (error) {
    console.error("Get today history error:", error);
    res.status(500).json({ error: "섭취 이력 조회 중 오류가 발생했습니다." });
  }
};

// 카페인 섭취 이력 조회 (기간별)
export const getHistory = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;
    const { startDate, endDate } = req.query;

    let query = `SELECT ch.*, m.menu_photo 
                 FROM caffeine_history ch
                 LEFT JOIN menu m ON ch.menu_id = m.menu_id
                 WHERE ch.member_id = ?`;
    const params: any[] = [memberId];

    if (startDate && endDate) {
      query += " AND DATE(ch.drinked_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    query += " ORDER BY ch.drinked_at DESC";

    const [history] = await pool.query(query, params);
    res.json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "섭취 이력 조회 중 오류가 발생했습니다." });
  }
};

// 현재 카페인 정보 조회
export const getCurrentCaffeineInfo = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;

    const [caffeineInfo] = await pool.query(
      "SELECT * FROM members_caffeine WHERE member_id = ?",
      [memberId],
    );

    if (!Array.isArray(caffeineInfo) || caffeineInfo.length === 0) {
      return res.status(404).json({ error: "카페인 정보를 찾을 수 없습니다." });
    }

    // 마지막 업데이트가 오늘이 아니면 current_caffeine 리셋
    const info = caffeineInfo[0] as any;
    const lastUpdate = new Date(info.updated_at);
    const today = new Date();

    if (lastUpdate.toDateString() !== today.toDateString()) {
      await pool.query(
        "UPDATE members_caffeine SET current_caffeine = 0, updated_at = NOW() WHERE member_id = ?",
        [memberId],
      );
      info.current_caffeine = 0;
    }

    res.json(info);
  } catch (error) {
    console.error("Get caffeine info error:", error);
    res.status(500).json({ error: "카페인 정보 조회 중 오류가 발생했습니다." });
  }
};

// 카페인 정보 업데이트 (체중, 최대 권장량 등)
export const updateCaffeineInfo = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const memberId = (req as any).user.memberId;
    const { weight_kg, max_caffeine } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (weight_kg !== undefined) {
      updates.push("weight_kg = ?");
      params.push(weight_kg);
    }

    if (max_caffeine !== undefined) {
      updates.push("max_caffeine = ?");
      params.push(max_caffeine);
    }

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ error: "업데이트할 정보가 없습니다." });
    }

    await connection.beginTransaction();

    try {
      // 카페인 정보 업데이트
      await connection.query(
        `UPDATE members_caffeine SET ${updates.join(", ")}, updated_at = NOW() WHERE member_id = ?`,
        [...params, memberId],
      );

      // 카페인 제한이 600mg 초과 시 챌린지 잠금
      let challengesLocked = false;
      if (max_caffeine !== undefined && max_caffeine > 600) {
        await connection.query(
          `UPDATE user_challenges 
           SET status = 'locked', 
               updated_at = NOW() 
           WHERE member_id = ? AND status IN ('not started', 'in progress')`,
          [memberId]
        );
        challengesLocked = true;
      } else if (max_caffeine !== undefined && max_caffeine <= 600) {
        // 카페인 제한이 600mg 이하로 낮아지면 잠금 해제
        await connection.query(
          `UPDATE user_challenges 
           SET status = 'not started', 
               updated_at = NOW() 
           WHERE member_id = ? AND status = 'locked'`,
          [memberId]
        );
      }

      await connection.commit();

      const [updatedInfo] = await pool.query(
        "SELECT * FROM members_caffeine WHERE member_id = ?",
        [memberId],
      );

      res.json({
        message: "카페인 정보가 업데이트되었습니다.",
        caffeineInfo: Array.isArray(updatedInfo) ? updatedInfo[0] : null,
        challengesLocked,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Update caffeine info error:", error);
    res
      .status(500)
      .json({ error: "카페인 정보 업데이트 중 오류가 발생했습니다." });
  } finally {
    connection.release();
  }
};
