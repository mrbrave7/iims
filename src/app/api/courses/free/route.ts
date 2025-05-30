import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest):Promise<NextResponse>{
    try {
        return NextResponse.json({message:"Hello From The Server"},{status:200})
    } catch (error) {
         return NextResponse.json({message:"Internal Server Error"},{status:500})
    }
}