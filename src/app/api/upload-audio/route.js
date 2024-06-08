import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
    }
});

export async function POST(req) {
    try {
        const data = await req.formData();
        const audioFile = data.get('audio')

        if (!audioFile) {
            return new Response(JSON.stringify({ message: "No audio to upload"}), {status: 400})
        }

        const fileName = `${Date.now()}.wav`;
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadParams = {
            Bucket: 'morning-routine-audio',
            Key: fileName,
            Body: buffer
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        return new Response(JSON.stringify({ message: "Audio uploaded successfully" }), {status: 200});
    } catch (error) {
        console.log("error: ", error)
        return new Response(JSON.stringify({ message: "Error completing project" }), {status: 500});
    }
}