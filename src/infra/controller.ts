import { NextResponse } from "next/server";
import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errorHandlerResponse(error: Error | any) {
  if (
    error instanceof MethodNotAllowedError ||
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return NextResponse.json(error, { status: error.statusCode });
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });

  console.error(publicErrorObject);

  return NextResponse.json(publicErrorObject, {
    status: publicErrorObject.statusCode,
  });
}

const controller = {
  errorHandlerResponse,
};

export default controller;
