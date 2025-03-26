import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Ajv, {JSONSchemaType} from 'ajv';
import {sign} from 'jsonwebtoken';

const VALID_USERNAME:string = 'Harry';
const VALID_PASSWORD:string = 'Potter';
const SECRET_KEY:string = "HermioneGranger1234567890";

interface RequestBody {
  username: string,
  password: string,
}

const validBodySchema: JSONSchemaType<RequestBody> = {
  type: "object",
  properties:{
    username: {type: "string"},
    password: {type: "string"},
  },
  required: ["username", "password"],
  additionalProperties: false,
}

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try{

    const evtBody: string = event?.body ? event.body : "";

    if (!evtBody) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Must provide a body"}),
      }
    }
    const ajv: Ajv = new Ajv();
    const validate = ajv.compile(validBodySchema);

    if (!validate(JSON.parse(evtBody))) {
      return {
        statusCode: 400,
        body: JSON.stringify(validate.errors),
      }
    }

    const body: RequestBody = JSON.parse(evtBody);


    if (body.username !== VALID_USERNAME || body.password !== VALID_PASSWORD) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Incorrect username or password"}),
      }
    }

    const token = sign({usenrname: body.username}, SECRET_KEY, {expiresIn: 60});

    return {
      statusCode: 200,
      body: JSON.stringify({message: "Succesfully Authenticated", token}),
    }

  } catch(error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error),
    }
  }


  return {
    statusCode: 200,
    body: JSON.stringify({message: 'Success'})
  }

}