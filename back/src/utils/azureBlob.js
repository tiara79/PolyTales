// Azure Blob Storage 업로드 유틸리티
const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_BLOB_CONTAINER = process.env.AZURE_BLOB_CONTAINER || 'profile-images';

if (!AZURE_STORAGE_CONNECTION_STRING) {
    module.exports = {
        uploadProfileImageToAzure: async () => {
            throw new Error('AZURE_STORAGE_CONNECTION_STRING env variable is required');
        }
    };
} else {

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(AZURE_BLOB_CONTAINER);

    async function uploadProfileImageToAzure(fileBuffer, fileName, mimetype) {
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: mimetype },
        });
        return blockBlobClient.url;
    }

    module.exports = { uploadProfileImageToAzure };
}
