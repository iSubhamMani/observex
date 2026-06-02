import { SQSClient } from "@aws-sdk/client-sqs";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import dotenv from "dotenv";

dotenv.config();

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

export const pushToQueue = async (payload: any) => {
  const command = new SendMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    MessageBody: JSON.stringify(payload),
  });

  return sqsClient.send(command);
};
