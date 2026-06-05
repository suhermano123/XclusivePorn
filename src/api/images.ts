import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/api/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const profile = req.query.profile as string;

    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 100);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("images")
      .select("*", { count: "exact" });

    if (profile) {
      query = query.eq(
        "tags->>profile",
        profile
      );
    }

    const { data, count, error } = await query
      .range(from, to)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      items: data,
      totalCount: count,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error loading images",
    });
  }
}