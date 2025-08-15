
const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const router = express.Router();
require('dotenv').config();

const upload = multer({ storage: multer.memoryStorage() });

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const BLOB_CONTAINER_NAME = process.env.BLOB_CONTAINER_NAME;
const BASE_BLOB_URL = process.env.AZURE_BLOB_BASE_URL;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

router.post('/', upload.single('profileImage'), async (req, res) => {
  try {
    const blobName = uuidv4() + path.extname(req.file.originalname);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const imageUrl = `${BASE_BLOB_URL}/${blobName}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Blob upload failed:', error.message);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;
