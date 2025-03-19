import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Usa variables de entorno sin el prefijo NEXT_PUBLIC_ para que sean privadas
const REGION = process.env.NEXT_PUBLIC_AWS_REGION;
const ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

const dynamoClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID || '',
    secretAccessKey: SECRET_ACCESS_KEY || '',
  },
});

export { dynamoClient };
