import { Request, Response } from "express";
import pool from "../config/database.js";

// 모든 브랜드 조회
export const getBrands = async (req: Request, res: Response) => {
  try {
    const [brands] = await pool.query(
      "SELECT * FROM brand ORDER BY brand_name",
    );
    res.json(brands);
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({ error: "브랜드 조회 중 오류가 발생했습니다." });
  }
};

// 특정 브랜드의 메뉴 조회
export const getMenusByBrand = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;

    const [menus] = await pool.query(
      `SELECT m.menu_id, m.menu_name, m.temp, m.size, m.caffeine_mg, m.menu_photo, m.category, b.brand_name 
       FROM menu m 
       JOIN brand b ON m.brand_id = b.brand_id 
       WHERE m.brand_id = ? 
       ORDER BY m.category, m.menu_name, m.size`,
      [brandId],
    );

    res.json(menus);
  } catch (error) {
    console.error("Get menus error:", error);
    res.status(500).json({ error: "메뉴 조회 중 오류가 발생했습니다." });
  }
};

// 모든 메뉴 조회 (브랜드 정보 포함)
export const getAllMenus = async (req: Request, res: Response) => {
  try {
    const [menus] = await pool.query(
      `SELECT m.menu_id, m.menu_name, m.temp, m.size, m.caffeine_mg, m.menu_photo, m.category, b.brand_name 
       FROM menu m 
       JOIN brand b ON m.brand_id = b.brand_id 
       ORDER BY b.brand_name, m.category, m.menu_name, m.size`,
    );

    res.json(menus);
  } catch (error) {
    console.error("Get all menus error:", error);
    res.status(500).json({ error: "메뉴 조회 중 오류가 발생했습니다." });
  }
};

// 메뉴 검색
export const searchMenus = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "검색어를 입력해주세요." });
    }

    const [menus] = await pool.query(
      `SELECT m.menu_id, m.menu_name, m.temp, m.size, m.caffeine_mg, m.menu_photo, m.category, b.brand_name 
       FROM menu m 
       JOIN brand b ON m.brand_id = b.brand_id 
       WHERE m.menu_name LIKE ? OR b.brand_name LIKE ?
       ORDER BY b.brand_name, m.menu_name`,
      [`%${query}%`, `%${query}%`],
    );

    res.json(menus);
  } catch (error) {
    console.error("Search menus error:", error);
    res.status(500).json({ error: "메뉴 검색 중 오류가 발생했습니다." });
  }
};

// 커스텀 음료 추가
export const addCustomMenu = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;
    const { menu_name, caffeine_mg } = req.body;

    if (!menu_name || caffeine_mg === undefined) {
      return res.status(400).json({ error: "메뉴 이름과 카페인 함량을 입력해주세요." });
    }

    const [result] = await pool.query(
      "INSERT INTO custom_menu (member_id, menu_name, caffeine_mg) VALUES (?, ?, ?)",
      [memberId, menu_name, caffeine_mg]
    );

    res.status(201).json({
      message: "커스텀 음료가 추가되었습니다.",
      custom_menu_id: (result as any).insertId,
    });
  } catch (error) {
    console.error("Add custom menu error:", error);
    if ((error as any)?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "이미 같은 이름의 커스텀 음료가 있습니다.",
      });
    }
    res.status(500).json({ error: "커스텀 음료 추가 중 오류가 발생했습니다." });
  }
};

// 사용자의 커스텀 음료 조회
export const getCustomMenus = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;

    const [menus] = await pool.query(
      "SELECT * FROM custom_menu WHERE member_id = ? ORDER BY created_at DESC",
      [memberId]
    );

    res.json(menus);
  } catch (error) {
    console.error("Get custom menus error:", error);
    res.status(500).json({ error: "커스텀 음료 조회 중 오류가 발생했습니다." });
  }
};

// 커스텀 음료 삭제
export const deleteCustomMenu = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;
    const { customMenuId } = req.params;

    // 본인의 커스텀 음료인지 확인
    const [menus] = await pool.query(
      "SELECT * FROM custom_menu WHERE custom_menu_id = ? AND member_id = ?",
      [customMenuId, memberId]
    );

    if (!Array.isArray(menus) || menus.length === 0) {
      return res.status(404).json({ error: "커스텀 음료를 찾을 수 없습니다." });
    }

    await pool.query(
      "DELETE FROM custom_menu WHERE custom_menu_id = ?",
      [customMenuId]
    );

    res.json({ message: "커스텀 음료가 삭제되었습니다." });
  } catch (error) {
    console.error("Delete custom menu error:", error);
    res.status(500).json({ error: "커스텀 음료 삭제 중 오류가 발생했습니다." });
  }
};
