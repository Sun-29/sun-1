const { Client } = require('minio');
const fs = require('fs');
const path = require('path');
const config = require('../config');

class StorageService {
  constructor() {
    this.useMinio = false;
    this.minioClient = null;
    this.bucket = null;
    this._init();
  }

  async _init() {
    try {
      if (config.minio && config.minio.endPoint) {
        this.minioClient = new Client({
          endPoint: config.minio.endPoint,
          port: config.minio.port,
          useSSL: config.minio.useSSL,
          accessKey: config.minio.accessKey,
          secretKey: config.minio.secretKey
        });
        this.bucket = config.minio.bucket;
        const exists = await this.minioClient.bucketExists(this.bucket);
        if (!exists) await this.minioClient.makeBucket(this.bucket);
        this.useMinio = true;
        console.log('[Storage] MinIO connected, bucket ready');
      }
    } catch (e) {
      console.warn('[Storage] MinIO unavailable, using local storage:', e.message);
      this.useMinio = false;
    }
  }

  /** Ensure a local directory exists */
  _ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async uploadFile(filePath, folder, fileName) {
    // Try MinIO, fall back to local storage
    if (this.useMinio && this.minioClient) {
      try {
        const objectName = `${folder}/${fileName || path.basename(filePath)}`;
        await this.minioClient.fPutObject(this.bucket, objectName, filePath);
        return `/uploads/${objectName}`;
      } catch (e) {
        console.warn('[Storage] MinIO upload failed, using local:', e.message);
      }
    }
    // Local filesystem fallback
    const destDir = path.join(config.upload.path, folder);
    this._ensureDir(destDir);
    const destName = fileName || path.basename(filePath);
    const dest = path.join(destDir, destName);
    fs.copyFileSync(filePath, dest);
    return `/uploads/${folder}/${path.basename(dest)}`;
  }

  async deleteFile(url) {
    if (!url) return;
    try {
      if (this.useMinio && this.minioClient) {
        const objectName = url.replace('/uploads/', '');
        await this.minioClient.removeObject(this.bucket, objectName);
      } else {
        const filePath = path.join(config.upload.path, url.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('[Storage] Delete failed:', e.message);
    }
  }

  async uploadAvatar(file) {
    return this.uploadFile(file.path, 'avatars', file.filename);
  }

  async uploadResume(file) {
    return this.uploadFile(file.path, 'resumes', file.filename);
  }

  async uploadRecording(file) {
    return this.uploadFile(file.path, 'recordings', file.filename);
  }
}

module.exports = new StorageService();
