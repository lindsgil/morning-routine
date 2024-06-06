import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains' // TODO: update this mainnet
import { CONTRACT_ADDRESS, CONTRACT_ABIS } from '@/utils/constants';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateItemCommand } from '@aws-sdk/lib-dynamodb';
import {PROJECT_ID} from "@/utils/constants";

const dynamoDbClient = new DynamoDBClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
    }
});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }

    const account = privateKeyToAccount(process.env.ADMIN_WALLET ?? '') 
    const walletClient = createWalletClient({
        account,
        chain: base,
        transport: http()
    })

    await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABIS.updateQualifications,
        functionName: 'updateQualifications',
        account,
        transactionArgs: []
    })

    // update num qualified
    const numQualified = await walletClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABIS.numQualified,
        functionName: 'numQualified'
    })

    const updateParams = {
        TableName: 'basement_projects_metadata', // Your table name
        Key: {
            project_id: { S: PROJECT_ID } // Adjust based on your partition key name and value
        },
        UpdateExpression: 'SET num_qualified = :newNum',
        ExpressionAttributeValues: {
            ':newNum': { N: numQualified }
        },
        ReturnValues: 'UPDATED_NEW' // Optionally return updated fields
    };

    const updateCommand = new UpdateItemCommand(updateParams);
    const response = await dynamoDbDocClient.send(updateCommand);
   
    return Response.json({ success: true });
}