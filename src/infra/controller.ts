import { NextResponse } from "next/server";
import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "./errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errorHandlerResponse(error: Error | any) {
  if (error instanceof MethodNotAllowedError) {
    return NextResponse.json(error, { status: error.statusCode });
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(error, { status: error.statusCode });
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });

  console.log(publicErrorObject);

  return NextResponse.json(publicErrorObject, {
    status: publicErrorObject.statusCode,
  });
}

const controller = {
  errorHandlerResponse,
};

export default controller;
