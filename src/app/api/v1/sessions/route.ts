import { NextRequest, NextResponse } from "next/server";
import { MethodNotAllowedError } from "infra/errors";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";

export async function POST(request: NextRequest) {
  const userInputValues = await request.json();

  try {
    const authenticatedUser = await authentication.getAuthenticatedUser(
      userInputValues.email,
      userInputValues.password,
    );
    const newSession = await session.create(authenticatedUser.id);

    const response = NextResponse.json(newSession, { status: 201 });
    controller.setSessionCookie(newSession.token, response);

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
