import { NextResponse } from "next/server";
import {
  getBiography,
  saveBiography
} from "@/lib/biographies";
import { getPersonByQid } from "@/lib/people";

function checkPassword(request: Request): boolean {
  const password = request.headers.get("x-admin-password");

  return (
    password !== null &&
    password === process.env.ADMIN_PASSWORD
  );
}

export async function GET(request: Request) {
  try {
    if (!checkPassword(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Yetkisiz erişim."
        },
        {
          status: 401
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const qid = searchParams.get("qid");

    if (!qid) {
      return NextResponse.json(
        {
          success: false,
          message: "QID gerekli."
        },
        {
          status: 400
        }
      );
    }

    const person = getPersonByQid(qid);

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          message: "Kişi bulunamadı."
        },
        {
          status: 404
        }
      );
    }

    const biography = getBiography(qid);

    return NextResponse.json({
      success: true,
      qid,
      person,
      biography
    });
  } catch (error) {
    console.error("KURDNAME ADMIN GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Sunucu hatası."
      },
      {
        status: 500
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!checkPassword(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Yetkisiz erişim."
        },
        {
          status: 401
        }
      );
    }

    const body = await request.json();

    const qid = body.qid;
    const biography = body.biography;

    if (!qid) {
      return NextResponse.json(
        {
          success: false,
          message: "QID gerekli."
        },
        {
          status: 400
        }
      );
    }

    if (typeof biography !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Biyografi metni geçersiz."
        },
        {
          status: 400
        }
      );
    }

    const person = getPersonByQid(qid);

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          message: "Kişi bulunamadı."
        },
        {
          status: 404
        }
      );
    }

    saveBiography(qid, biography);

    return NextResponse.json({
      success: true,
      message: "Biyografi başarıyla kaydedildi.",
      qid
    });
  } catch (error) {
    console.error("KURDNAME ADMIN POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Biyografi kaydedilemedi."
      },
      {
        status: 500
      }
    );
  }
}
