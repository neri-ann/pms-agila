const { google } = require('googleapis');
const fs = require('fs');

class GoogleDriveService {
  constructor() {
    this.oauth2Client = null;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.scopes = ['https://www.googleapis.com/auth/drive.file'];
    this.isInitialized = false;
  }

  /**
   * Initialize the OAuth2 client with environment credentials
   */
  async initialize() {
    try {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
        throw new Error('Missing required Google OAuth2 credentials in environment variables');
      }

      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Set the refresh token
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });

      // Get initial access token
      await this.refreshAccessToken();
      
      this.isInitialized = true;
      console.log('✅ Google Drive Service initialized successfully');
      
      return this.oauth2Client;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive Service:', error.message);
      throw error;
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken() {
    try {
      console.log('🔄 Refreshing Google access token...');
      
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update credentials
      this.oauth2Client.setCredentials(credentials);
      this.accessToken = credentials.access_token;
      
      // Set token expiry (subtract 5 minutes for safety margin)
      this.tokenExpiry = new Date(Date.now() + (credentials.expiry_date - Date.now() - 300000));
      
      console.log(`✅ Access token refreshed successfully. Expires at: ${this.tokenExpiry}`);
      
      return credentials.access_token;
    } catch (error) {
      console.error('❌ Failed to refresh access token:', error.message);
      
      // Check if refresh token is invalid/revoked
      if (error.message.includes('invalid_grant') || error.message.includes('Token has been revoked')) {
        console.error('🚨 Refresh token is invalid or revoked. Manual reauthorization required.');
        throw new Error('Refresh token invalid. Please reauthorize the application.');
      }
      
      throw error;
    }
  }

  /**
   * Ensure we have a valid access token before making API calls
   */
  async ensureValidToken() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const shouldRefresh = !this.tokenExpiry || (this.tokenExpiry - now) < 300000; // 5 minutes

    if (shouldRefresh) {
      await this.refreshAccessToken();
    }

    return this.oauth2Client;
  }

  /**
   * Get an authenticated Google Drive client
   */
  async getDriveClient() {
    const authClient = await this.ensureValidToken();
    return google.drive({ version: 'v3', auth: authClient });
  }

  /**
   * Upload file to Google Drive with automatic token management
   */
  async uploadFile(filePath, fileName, mimeType = 'application/octet-stream') {
    try {
      const drive = await this.getDriveClient();
      
      console.log(`📤 Uploading file to Google Drive: ${fileName}`);

      const fileMetadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath)
      };

      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink,mimeType,size,createdTime'
      });

      console.log(`✅ File uploaded successfully: ${response.data.name} (ID: ${response.data.id})`);
      
      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        mimeType: response.data.mimeType,
        size: response.data.size,
        createdTime: response.data.createdTime
      };
    } catch (error) {
      console.error(`❌ Failed to upload file ${fileName}:`, error.message);
      
      // If it's a token error, try refreshing once more
      if (error.message.includes('invalid_grant') || error.message.includes('Invalid Credentials')) {
        console.log('🔄 Attempting token refresh due to auth error...');
        try {
          await this.refreshAccessToken();
          // Retry the upload once
          return await this.uploadFile(filePath, fileName, mimeType);
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError.message);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId) {
    try {
      const drive = await this.getDriveClient();
      
      console.log(`📥 Downloading file from Google Drive: ${fileId}`);

      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {
        responseType: 'stream'
      });

      console.log(`✅ File download initiated for: ${fileId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to download file ${fileId}:`, error.message);
      
      // Handle token errors
      if (error.message.includes('invalid_grant') || error.message.includes('Invalid Credentials')) {
        console.log('🔄 Attempting token refresh due to auth error...');
        try {
          await this.refreshAccessToken();
          return await this.downloadFile(fileId);
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError.message);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Get file metadata from Google Drive
   */
  async getFileMetadata(fileId) {
    try {
      const drive = await this.getDriveClient();
      
      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink'
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Failed to get file metadata ${fileId}:`, error.message);
      
      // Handle token errors
      if (error.message.includes('invalid_grant') || error.message.includes('Invalid Credentials')) {
        console.log('🔄 Attempting token refresh due to auth error...');
        try {
          await this.refreshAccessToken();
          return await this.getFileMetadata(fileId);
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError.message);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId) {
    try {
      const drive = await this.getDriveClient();
      
      console.log(`🗑️ Deleting file from Google Drive: ${fileId}`);

      await drive.files.delete({
        fileId: fileId
      });

      console.log(`✅ File deleted successfully: ${fileId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete file ${fileId}:`, error.message);
      
      // Handle token errors
      if (error.message.includes('invalid_grant') || error.message.includes('Invalid Credentials')) {
        console.log('🔄 Attempting token refresh due to auth error...');
        try {
          await this.refreshAccessToken();
          return await this.deleteFile(fileId);
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError.message);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Get current token status for debugging
   */
  getTokenStatus() {
    return {
      isInitialized: this.isInitialized,
      hasAccessToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry,
      isTokenExpired: this.tokenExpiry ? new Date() > this.tokenExpiry : true,
      timeUntilExpiry: this.tokenExpiry ? this.tokenExpiry - new Date() : null
    };
  }
}

// Create singleton instance
const googleDriveService = new GoogleDriveService();

module.exports = googleDriveService;
