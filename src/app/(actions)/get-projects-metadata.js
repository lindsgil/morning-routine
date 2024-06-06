'use server'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import {PROJECT_ID} from "@/utils/constants";

const dynamoDbClient = new DynamoDBClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
    }
});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

export async function getProjectsMetadata(
) {
    const command = new GetCommand({
        TableName: 'basement_projects_metadata',
        Key: {
            'project_id': PROJECT_ID
        },
        ProjectionExpression: 'auction_start_datetime, invocations, num_qualified, game_start_datetime, total_eth'
    })

    try {
        const data = await dynamoDbDocClient.send(command);
        return {status: "OK", data: data.Item}
      } catch (error) {
        console.error('Error retrieving item:', error);
        return {status: "ERROR", message: "Error retrieving item"}
      }
}