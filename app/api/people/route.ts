import { NextResponse } from "next/server";
import { getPeople } from "@/lib/people";

export async function GET() {
  try {
    const people = getPeople();

    return NextResponse.json({
      success: true,
      count: people.length,
      people,
    });
  } catch (error) {
    console.error("KURDNAME PEOPLE API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        people: [],
      },
      {
        status: 500,
      }
    );
  }
}
