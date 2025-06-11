import { NextRequest, NextResponse } from "next/server";
import { MethodNotAllowedError } from "infra/errors";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";
import * as cookie from "cookie";

export async function POST(request: NextRequest) {
  const userInputValues = await request.json();

  try {
    const authenticatedUser = await authentication.getAuthenticatedUser(
      userInputValues.email,
      userInputValues.password,
    );
    const newSession = await session.create(authenticatedUser.id);

    const setCookie = cookie.serialize("session_id", newSession.token, {
      path: "/",
      maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const response = NextResponse.json(newSession, { status: 201 });

    response.headers.set("Set-Cookie", setCookie);

    return response;
  } catch (error) {
    return controller.errorHandlerResponse(error);
  }
}

export async function GET() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export function PUT() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export function DELETE() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export function PATCH() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}
