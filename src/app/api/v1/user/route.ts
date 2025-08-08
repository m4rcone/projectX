import controller from "infra/controller";
import { MethodNotAllowedError } from "infra/errors";
import session from "models/session";
import user from "models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_id").value;

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userFound = await user.findOneById(sessionObject.user_id);

    const renewedSessionObject = await session.renew(sessionObject.id);

    const response = NextResponse.json(userFound, { status: 200 });
    controller.setSessionCookie(renewedSessionObject.token, response);

    return response;
  } catch (error) {
    return controller.errorHandlerResponse(error);
  }
}

export async function POST() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export async function PUT() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export async function PATCH() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export async function DELETE() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}
