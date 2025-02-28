import { NextResponse } from "next/server";
import database from "infra/database";

export async function GET() {
  const result = await database.query("SELECT 1+1 as sum");
  console.log(result.rows);
  return NextResponse.json({ message: "Teste" });
}
