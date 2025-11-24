import { Request, Response } from "express";
import pool from "../config/database.js";

// 현재 포인트 조회
export const getCurrentPoints = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user?.memberId;

    if (!memberId) {
      return res.status(401).json({ error: "인증 정보가 없습니다." });
    }

    const [memberRows] = await pool.query(
      `SELECT point FROM members WHERE member_id = ?`,
      [memberId],
    );

    let currentPoints = 0;
    if (Array.isArray(memberRows) && memberRows.length > 0) {
      const member = memberRows[0] as any;
      currentPoints = Number(member.point || 0);
    }

    res.json({ currentPoints });
  } catch (error) {
    console.error("Get current points error:", error);
    res.status(500).json({ error: "포인트 조회 중 오류가 발생했습니다." });
  }
};

// 포인트 차감
export const deductPoints = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const memberId = (req as any).user?.memberId;
    const { points } = req.body;

    if (!memberId) {
      return res.status(401).json({ error: "인증 정보가 없습니다." });
    }

    if (!points || points <= 0) {
      return res.status(400).json({ error: "잘못된 포인트 값입니다." });
    }

    await connection.beginTransaction();

    // 사용자 포인트 조회 (FOR UPDATE로 잠금)
    const [memberRows] = await connection.query(
      `SELECT point FROM members WHERE member_id = ? FOR UPDATE`,
      [memberId],
    );

    if (!Array.isArray(memberRows) || memberRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const member = memberRows[0] as any;
    const currentPoints = Number(member.point || 0);

    // 포인트 충분한지 확인
    if (currentPoints < points) {
      await connection.rollback();
      return res.status(400).json({ error: "포인트가 부족합니다." });
    }

    // 포인트 차감
    await connection.query(
      `UPDATE members SET point = point - ? WHERE member_id = ?`,
      [points, memberId],
    );

    await connection.commit();

    res.json({
      message: "포인트가 차감되었습니다.",
      remaining_points: currentPoints - points,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Deduct points error:", error);
    res.status(500).json({ error: "포인트 차감 중 오류가 발생했습니다." });
  } finally {
    connection.release();
  }
};

