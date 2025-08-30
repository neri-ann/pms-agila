// Procument-Managemant-System\backend\controllers\guidanceDoc.js
const fs = require('fs');
const path = require('path');
const Guidance = require("../Models/guidanceDoc");
const googleDriveService = require('../services/googleDriveService');
//const apiKeyConfig = require('../config');

// Upload guidance document
exports.upload = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if req.file is defined
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log(`📋 Processing guidance document upload: ${req.file.originalname}`);

        const file = req.file.path;
        const fileNameWithTimestamp = path.basename(file);
        const actualName = name || fileNameWithTimestamp.split('_').slice(1).join('_');

        // Upload to Google Drive using the new service
        const driveResponse = await googleDriveService.uploadFile(
            file,
            `GUIDANCE_${actualName}`,
            'application/pdf'
        );

        // Create a new guidance document with Google Drive file ID and additional metadata
        const newGuidance = new Guidance({ 
            name: actualName, 
            file: driveResponse.id,
            googleDriveId: driveResponse.id,
            webViewLink: driveResponse.webViewLink,
            uploadDate: new Date()
        });

        // Save the data in the database
        await newGuidance.save();

        // Clean up local file
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }

        console.log(`✅ Guidance document uploaded successfully: ${actualName}`);

        res.json({ 
            guidance: newGuidance, 
            message: "File successfully uploaded to Google Drive",
            driveFileId: driveResponse.id
        });
    } catch (error) {
        console.error("❌ Error uploading guidance:", error);
        
        // Clean up local file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        // Provide more specific error messages
        if (error.message.includes('Refresh token invalid')) {
            return res.status(401).json({ 
                error: "Google Drive authentication failed. Please contact administrator to reauthorize.", 
                details: error.message 
            });
        }
        
        res.status(500).json({ 
            error: "Failed to upload guidance document",
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};


// View all guidance documents
exports.viewGuidance = async (req, res) => {
    try {
        const guidanceItems = await Guidance.find();
        
        // Enhanced response with file details for modal display
        const enhancedGuidance = guidanceItems.map(guidance => ({
            _id: guidance._id,
            name: guidance.name,
            file: guidance.file,
            googleDriveId: guidance.googleDriveId,
            webViewLink: guidance.webViewLink,
            uploadDate: guidance.uploadDate,
            fileDetails: {
                filename: guidance.name,
                type: 'guidance',
                googleDriveId: guidance.googleDriveId,
                webViewLink: guidance.webViewLink,
                canView: !!guidance.googleDriveId,
                canDownload: !!guidance.googleDriveId
            }
        }));

        res.json({ 
            guidance: enhancedGuidance,
            totalCount: enhancedGuidance.length
        });
    } catch (error) {
        console.error("Error fetching guidance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Download guidance document
exports.downloadGuidance = async (req, res) => {
    try {
        const guidanceId = req.params.id;
        const guidance = await Guidance.findById(guidanceId);


        if (!guidance) {
            return res.status(404).json({ status: "Guidance not found" });
        }


        const authClient = await authorize();
        await downloadFileFromGoogleDrive(authClient, guidance.file, res);
    } catch (error) {
        console.error('Error downloading guidance:', error);
        res.status(500).json({ status: "Error while downloading guidance", error: error.message });
    }
};


// View PDF guidance document
exports.viewPdf = async (req, res) => {
    try {
        const guidanceId = req.params.id;
        const guidance = await Guidance.findById(guidanceId);

        if (!guidance) {
            return res.status(404).json({ status: "Guidance not found" });
        }

        console.log(`📖 Viewing PDF guidance document: ${guidance.name}`);

        // Use the new Google Drive service to download the file
        const fileStream = await googleDriveService.downloadFile(guidance.file);
        
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${guidance.name}.pdf"`);
        
        fileStream.pipe(res);
        
        console.log(`✅ PDF guidance document served: ${guidance.name}`);
    } catch (error) {
        console.error("❌ Error viewing PDF:", error);
        
        if (error.message.includes('Refresh token invalid')) {
            return res.status(401).json({ 
                error: "Google Drive authentication failed. Please contact administrator to reauthorize."
            });
        }
        
        res.status(500).send("An error occurred while viewing the PDF");
    }
};

// Delete guidance document
exports.deleteGuidance = async (req, res) => {
    try {
        const guidanceId = req.params.id;
        const guidance = await Guidance.findById(guidanceId);

        if (!guidance) {
            return res.status(404).json({ status: "Guidance not found" });
        }

        console.log(`🗑️ Deleting guidance document: ${guidance.name}`);

        // Delete from Google Drive using the new service
        try {
            await googleDriveService.deleteFile(guidance.file);
            console.log(`✅ Guidance document deleted from Google Drive: ${guidance.name}`);
        } catch (driveError) {
            console.error(`❌ Failed to delete from Google Drive:`, driveError);
            // Continue with database deletion even if Google Drive deletion fails
        }

        // Delete from database
        await Guidance.findByIdAndDelete(guidanceId);

        console.log(`✅ Guidance document deleted from database: ${guidance.name}`);

        res.status(200).json({ 
            status: "Guidance deleted successfully",
            deletedGuidance: guidance
        });
    } catch (error) {
        console.error('❌ Error deleting guidance:', error);
        
        if (error.message.includes('Refresh token invalid')) {
            return res.status(401).json({ 
                error: "Google Drive authentication failed. Please contact administrator to reauthorize.", 
                details: error.message 
            });
        }
        
        res.status(500).json({ 
            status: "Error with delete guidance", 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};





