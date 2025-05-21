import { NextRequest } from "next/server";

declare module "next/server" {
  interface NextRequest {
    params?:{
        id:string | undefined
    } | any
    ip:string,
  }
}