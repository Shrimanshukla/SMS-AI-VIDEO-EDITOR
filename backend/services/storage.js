import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read'
    };

    try {
        const data = await s3.upload(params).promise();
        return data.Location;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Failed to upload to S3: ' + error.message);
    }
};

export const downloadFromS3 = async (fileKey) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey
    };

    try {
        const data = await s3.getObject(params).promise();
        return data.Body;
    } catch (error) {
        console.error('S3 download error:', error);
        throw new Error('Failed to download from S3: ' + error.message);
    }
};

export const deleteFromS3 = async (fileKey) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('S3 delete error:', error);
        throw new Error('Failed to delete from S3: ' + error.message);
    }
};
