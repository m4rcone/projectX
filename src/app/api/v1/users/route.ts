import { NextRequest, NextResponse } from "next/server";
import { MethodNotAllowedError } from "infra/errors";
import user from "models/user";
import controller from "infra/controller";

export async function POST(request: NextRequest) {
  try {
    const userInputValues = await request.json();
    const newUser = await user.create(userInputValues);

    return NextResponse.json(newUser, { status: 201 });
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
