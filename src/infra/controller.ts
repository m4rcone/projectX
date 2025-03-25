import { NextResponse } from "next/server";
import { InternalServerError } from "./errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errorHandlerResponse(error: Error | any) {
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
