const procReqest = require("../Models/procReqest");
const User = require("../Models/user");
const path = require("path");
const Budget = require('../Models/budget');
const fs = require('fs');
const googleDriveService = require('../services/googleDriveService');

const { PDFDocument, rgb } = require("pdf-lib");
// const fs = require('fs').promises;

// Generate Request ID
exports.generateRequestId = async (req, res) => {
  try {
    // Get all existing requestIds and find the highest number
    const allRequests = await procReqest.find({}, { requestId: 1 }).sort({ requestId: -1 });
    
    let maxNumber = 0;
    
    // Parse all existing requestIds to find the highest number
    allRequests.forEach(request => {
      if (request.requestId && request.requestId.startsWith('REQ')) {
        const numericPart = request.requestId.slice(3);
        const number = parseInt(numericPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });

    // Generate the next unique requestId
    const nextNumber = maxNumber + 1;
    const newRequestId = "REQ" + String(nextNumber).padStart(3, "0");
    
    console.log("Generated unique requestId:", newRequestId);
    console.log("Based on max existing number:", maxNumber);

    // Just return the generated ID without creating database entry
    res.json({ requestId: newRequestId });
  } catch (error) {
    console.error("Error in generateRequestId:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  const requestId = req.params.requestId;
  const {
    faculty,
    department,
    budgetPeriod,
    fiscalYear,
    budgetId,
    date,
    contactNo,
    contactPerson,
    budgetAllocation,
    usedAmount,
    balanceAvailable,
    purpose,
    sendTo,
    items,
    files
  } = req.body;

  console.log("Backend received data:", req.body);
  console.log("Items received:", items);
  console.log("Items type:", typeof items);

  try {
    // Convert items object to array format expected by MongoDB
    const itemsArray = items && typeof items === 'object' ? Object.values(items) : [];
    const filesArray = files && typeof files === 'object' ? Object.values(files) : [];
    
    console.log("Converted items array:", itemsArray);
    console.log("Items array length:", itemsArray.length);
    
    // Create a new request (no need to check for existing since generateRequestId doesn't create DB entry)
    const newprocReqest = new procReqest({
      requestId,
      faculty,
      department,
      budgetPeriod,
      fiscalYear: fiscalYear || new Date().getFullYear(),
      budgetId,
      date,
      contactNo,
      contactPerson,
      budgetAllocation,
      usedAmount,
      balanceAvailable,
      purpose,
      sendTo,
      items: itemsArray,
      files: filesArray
    });

    // Save the new document to the database
    const createdRequest = await newprocReqest.save();
    console.log("Request created successfully:", createdRequest);

    // Send the created document as a response
    res.json(createdRequest);
  } catch (error) {
    console.error("Error in createRequest:", error);
    // Handle errors and send an appropriate response
    res.status(500).json({ error: error.message });
  }
};

exports.viewAllRequests = async (req, res) => {
  try {
    // Fetch all requests from the database
    const allRequests = await procReqest.find();

    // Enhanced response with files and specifications summary for each request
    const enhancedRequests = allRequests.map(request => ({
      ...request.toObject(),
      filesSummary: {
        totalFiles: (request.files || []).length,
        totalSpecifications: (request.specifications || []).length,
        files: request.files || [],
        specifications: request.specifications || []
      }
    }));

    // Send the enhanced list of requests as a response
    res.json(enhancedRequests);
  } catch (error) {
    console.error("Error fetching all requests:", error);
    // Handle errors and send an appropriate response
    res.status(500).json({ error: error.message });
  }
};
// View requests by department
exports.viewRequestsByDepartment = async (req, res) => {
  const userId = req.params.id;
  try {
    // Fetch the logged-in user to get their department
    const user = await User.findById(userId); // Corrected from findOne to findById
    if (!user) {
      return res.status(404).json({ status: "User not found" });
    }

    // Fetch requests where the department matches the logged-in user's department
    const requests = await procReqest.find({ department: user.department });
    // console.log(requests);
    
    // Enhanced response with files and specifications summary for each request
    const enhancedRequests = requests.map(request => ({
      ...request.toObject(),
      filesSummary: {
        totalFiles: (request.files || []).length,
        totalSpecifications: (request.specifications || []).length,
        files: request.files || [],
        specifications: request.specifications || []
      }
    }));
    
    // Send the enhanced filtered list of requests as a response
    res.json(enhancedRequests);
  } catch (error) {
    console.error("Error fetching requests by department:", error);
    // Handle errors and send an appropriate response
    res.status(500).json({ error: error.message });
  }
};

exports.viewRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the request by ID
    const request = await procReqest.findOne({ requestId });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Enhanced response with both files and specifications clearly separated
    const response = {
      ...request.toObject(),
      filesSummary: {
        totalFiles: (request.files || []).length,
        totalSpecifications: (request.specifications || []).length,
        files: request.files || [],
        specifications: request.specifications || []
      }
    };

    // Send the enhanced request as a response
    res.json(response);
  } catch (error) {
    console.error("Error fetching request by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// View files and specifications for a specific request (for modal display)
exports.viewRequestFilesAndSpecs = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the request by ID, but only select files and specifications
    const request = await procReqest.findOne({ requestId }).select('requestId files specifications');

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Prepare detailed response for modal display
    const response = {
      requestId: request.requestId,
      files: {
        count: (request.files || []).length,
        items: (request.files || []).map((file, index) => ({
          id: file._id,
          index: index + 1,
          filename: file.filename,
          googleDriveId: file.googleDriveId,
          filepath: file.filepath,
          mimeType: file.mimeType,
          type: 'file'
        }))
      },
      specifications: {
        count: (request.specifications || []).length,
        items: (request.specifications || []).map((spec, index) => ({
          id: spec._id,
          index: index + 1,
          filename: spec.filename,
          googleDriveId: spec.googleDriveId,
          filepath: spec.filepath,
          mimeType: spec.mimeType,
          type: 'specification'
        }))
      },
      totalAttachments: (request.files || []).length + (request.specifications || []).length
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching request files and specifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteRequest = async (req, res) => {
  let requestID = req.params.id;

  try {
    await procReqest.findByIdAndDelete(requestID);
    res.status(200).send({ status: "Request is deleted" });
  } catch (err) {
    res.status(500).send({ status: "Error with delete request" });
  }
};

// Add Item to Request

exports.addProcItem = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { itemName, cost, qtyRequired, qtyAvailable } = req.body;

    const updatedRequest = await procReqest.findOneAndUpdate(
      { requestId },
      {
        $push: {
          items: {
            itemName,
            cost,
            qtyRequired,
            qtyAvailable,
          },
        },
      },
      { new: true }
    );

    res.json({ message: "Item added successfully", updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.veiwProcItems = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the request by ID and select only the items field
    const request = await procReqest.findOne({ requestId }).select("items");

    // Check if request is null
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Send the procurement items associated with the request as a response
    res.json(request.items);
  } catch (error) {
    console.error("Error fetching procurement items:", error);
    // Handle errors and send an appropriate response
    res.status(500).json({ error: error.message });
  }
};

// Delete Item from Request
exports.deleteProcItem = async (req, res) => {
  try {
    const updatedRequest = await procReqest.findOneAndUpdate(
      { requestId: req.params.requestId },
      { $pull: { items: { itemId: req.params.itemId } } },
      { new: true }
    );

    res.json({ message: "Item deleted successfully", updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`📁 Processing file upload: ${req.file.originalname} for request ${req.params.requestId}`);

    // Determine MIME type based on file extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    switch (fileExtension) {
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      case '.doc':
        mimeType = 'application/msword';
        break;
      case '.docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.txt':
        mimeType = 'text/plain';
        break;
      case '.xls':
        mimeType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }

    // Upload file to Google Drive using the service
    const driveResponse = await googleDriveService.uploadFile(
      req.file.path,
      req.file.originalname,
      mimeType
    );

    const fileData = {
      filepath: driveResponse.webViewLink, // Store Google Drive view link
      filename: req.file.originalname,
      googleDriveId: driveResponse.id, // Store Google Drive file ID
      mimeType: mimeType,
      size: driveResponse.size,
      uploadDate: new Date()
    };

    // Update the procurement request with the file data
    const updatedRequest = await procReqest.findOneAndUpdate(
      { requestId: req.params.requestId },
      { $push: { files: fileData } },
      { new: true }
    );

    if (!updatedRequest) {
      // If request not found, try to delete the uploaded file from Google Drive
      try {
        await googleDriveService.deleteFile(driveResponse.id);
      } catch (deleteError) {
        console.error('Failed to cleanup uploaded file from Google Drive:', deleteError);
      }
      return res.status(404).json({ error: "Request not found" });
    }

    // Clean up local file after successful upload to Google Drive
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.log(`✅ File uploaded successfully to Google Drive and database updated for request ${req.params.requestId}`);

    res.json({
      message: "File uploaded successfully",
      file: fileData,
      request: updatedRequest
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    
    // Clean up local file if there was an error
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
      error: "Failed to upload file", 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
exports.uploadSpecification = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No specification file uploaded" });
    }

    console.log(`📋 Processing specification upload: ${req.file.originalname} for request ${req.params.requestId}`);

    // Determine MIME type based on file extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    switch (fileExtension) {
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      case '.doc':
        mimeType = 'application/msword';
        break;
      case '.docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.txt':
        mimeType = 'text/plain';
        break;
      case '.xls':
        mimeType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }

    // Upload specification file to Google Drive using the service
    const driveResponse = await googleDriveService.uploadFile(
      req.file.path,
      `SPEC_${req.file.originalname}`, // Prefix with SPEC_ for easy identification
      mimeType
    );

    const specificationData = {
      filepath: driveResponse.webViewLink, // Store Google Drive view link
      filename: req.file.originalname,
      googleDriveId: driveResponse.id, // Store Google Drive file ID
      mimeType: mimeType,
      size: driveResponse.size,
      uploadDate: new Date()
    };

    // Update the document in the database with the specifications
    const updatedRequest = await procReqest.findOneAndUpdate(
      { requestId: req.params.requestId },
      { $push: { specifications: specificationData } },
      { new: true }
    );

    if (!updatedRequest) {
      // If request not found, try to delete the uploaded file from Google Drive
      try {
        await googleDriveService.deleteFile(driveResponse.id);
      } catch (deleteError) {
        console.error('Failed to cleanup uploaded specification from Google Drive:', deleteError);
      }
      return res.status(404).json({ error: "Request not found" });
    }

    // Clean up local file after successful upload to Google Drive
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.log(`✅ Specification uploaded successfully to Google Drive and database updated for request ${req.params.requestId}`);

    res.json({
      message: "Specification uploaded successfully",
      specification: specificationData,
      request: updatedRequest
    });
  } catch (error) {
    console.error("❌ Error uploading specification:", error);
    
    // Clean up local file if there was an error
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
      error: "Failed to upload specification", 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const fileId = req.params.id;

    console.log(`📥 Download request for file ${fileId} in request ${requestId}`);

    const request = await procReqest.findOne({ requestId });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Find the file by its MongoDB _id
    const file = request.files.find((file) => file._id.toString() === fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // If it's a Google Drive file, redirect to the download link
    if (file.googleDriveId) {
      try {
        // Get the file stream from Google Drive
        const fileStream = await googleDriveService.downloadFile(file.googleDriveId);
        
        // Set appropriate headers
        res.set({
          'Content-Type': file.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.filename}"`,
        });

        // Pipe the file stream to the response
        fileStream.pipe(res);
        
        console.log(`✅ File download initiated: ${file.filename}`);
      } catch (driveError) {
        console.error(`❌ Failed to download from Google Drive:`, driveError);
        
        // Fallback: redirect to Google Drive view link if direct download fails
        if (file.filepath) {
          return res.redirect(file.filepath);
        }
        
        return res.status(500).json({ 
          error: "Failed to download file from Google Drive",
          details: driveError.message 
        });
      }
    } else {
      // Legacy: handle local files (backward compatibility)
      const filepath = file.filepath.replace(/\\/g, "/");

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: "File not found on the server" });
      }

      res.download(filepath, file.filename);
    }
  } catch (error) {
    console.error("❌ Error in downloadFile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete file from both database and Google Drive
exports.deleteFile = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const fileId = req.params.id;

    console.log(`🗑️ Delete request for file ${fileId} in request ${requestId}`);

    const request = await procReqest.findOne({ requestId });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Find the file by its MongoDB _id
    const fileIndex = request.files.findIndex((file) => file._id.toString() === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = request.files[fileIndex];

    // Delete from Google Drive if it exists there
    if (file.googleDriveId) {
      try {
        await googleDriveService.deleteFile(file.googleDriveId);
        console.log(`✅ File deleted from Google Drive: ${file.filename}`);
      } catch (driveError) {
        console.error(`❌ Failed to delete from Google Drive:`, driveError);
        // Continue with database deletion even if Google Drive deletion fails
      }
    }

    // Remove from database
    const updatedRequest = await procReqest.findOneAndUpdate(
      { requestId },
      { $pull: { files: { _id: fileId } } },
      { new: true }
    );

    console.log(`✅ File deleted from database: ${file.filename}`);

    res.json({
      message: "File deleted successfully",
      deletedFile: file,
      request: updatedRequest
    });
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Google Drive token status (for debugging)
exports.getTokenStatus = async (req, res) => {
  try {
    const status = googleDriveService.getTokenStatus();
    res.json({
      googleDriveStatus: status,
      timestamp: new Date(),
      environment: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
        hasFolderId: !!process.env.GOOGLE_DRIVE_FOLDER_ID
      }
    });
  } catch (error) {
    console.error("❌ Error getting token status:", error);
    res.status(500).json({ error: error.message });
  }
};

// Initialize Google Drive service (for testing)
exports.initializeGoogleDrive = async (req, res) => {
  try {
    await googleDriveService.initialize();
    const status = googleDriveService.getTokenStatus();
    res.json({
      message: "Google Drive service initialized successfully",
      status: status
    });
  } catch (error) {
    console.error("❌ Error initializing Google Drive:", error);
    res.status(500).json({ 
      error: "Failed to initialize Google Drive service",
      details: error.message 
    });
  }
};

exports.viewFiles = async (req, res) => {
  try {
    const requests = await procReqest.find();
    const allFiles = [];

    // Iterate through each request and extract files
    requests.forEach((request) => {
      const files = request.files.map((file) => ({
        requestId: request.requestId,
        filename: file.filename,
        filepath: file.filepath,
      }));
      allFiles.push(...files);
    });

    res.json({ files: allFiles });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const updatedRequest = await procReqest.findOneAndUpdate(
      { requestId: req.params.requestId },
      { $pull: { files: { _id: req.params.filename } } }, // Using the string directly
      { new: true }
    );

    res.json({ message: "file deleted successfully", updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generatePdf = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the request document by ID
    const request = await procReqest.findOne({ requestId });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    // Add text to the PDF
    const text = `
      Faculty: ${request.faculty}
      Department: ${request.department}
      Date: ${request.date}
      Contact No: ${request.contactNo}
      Contact Person: ${request.contactPerson}
      Budget Allocation: ${request.budgetAllocation}
      Used Amount: ${request.usedAmount}
      Balance Available: ${request.balanceAvailable}
      Purpose: ${request.purpose}
      Send To: ${request.sendTo}
      Items: ${request.items.map((item) => item.itemName).join(", ")}
    `;
    page.drawText(text, {
      x: 50,
      y: 750,
    });

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${requestId}.pdf"`
    );

    // Send the PDF as a downloadable file
    res.send(pdfBytes);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ error: "Error generating PDF", message: error.message });
  }
};

exports.downloadPdf = async (req, res) => {
  const requestId = req.params.requestId;

  try {
    // Generate PDF bytes
    const pdfBytes = await exports.generatePdf(requestId);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="request_${requestId}.pdf"`
    );

    // Send the PDF as a downloadable file
    res.send(pdfBytes);
  } catch (error) {
    if (error.message === "Request not found") {
      return res.status(404).json({ error: "Request not found" });
    }
    console.error("Error downloading PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const fs = require('fs').promises;
// const docx = require('docx');

// const inputPath = 'test.docx'; // Path to your Word template
// const outputPath = 'output.docx'; // Path to save the generated document

// exports.generateWordDocument = async (req, res) => {
//   try {
//     const { requestId } = req.params;

//     // Retrieve request data from MongoDB
//     const request = await procReqest.findOne({ requestId });

//     if (!request) {
//       return res.status(404).json({ error: 'Request not found' });
//     }

//     // Read the Word template
//     const templateBuffer = await fs.readFile(inputPath);

//     // Create a new document from the template buffer
//     const doc = new docx.Document(templateBuffer);

//     // Check if options2 is defined and contains the sections property
//     if (!options2 || !options2.sections || !Array.isArray(options2.sections)) {
//       throw new Error('Error generating Word document: options2.sections is not defined or not an array');
//     }

//     // Iterate over each section and add it to the document
//     for (const section of options2.sections) {
//       this.addSection(section);
//     }

//     // Replace placeholders with data in the entire document text
//     doc.getBody().getChildren().forEach((child) => {
//       if (child instanceof docx.Paragraph) {
//         const text = child.getText();
//         const updatedText = text
//           .replace('{{requestId}}', request.requestId)
//           .replace('{{purpose}}', request.purpose)
//           .replace('{{sendTo}}', request.sendTo);
//         // Add other placeholder replacements as needed
//         child.removeChildren();
//         child.addRun(new docx.TextRun({ text: updatedText }));
//       }
//     });

//     // Serialize the document to a buffer
//     const buffer = await docx.Packer.toBuffer(doc);

//     // Write the buffer content to the output file
//     await fs.writeFile(outputPath, buffer);

//     // Set response headers for Word download
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//     res.setHeader('Content-Disposition', `attachment; filename="output.docx"`);

//     // Send the Word document as a downloadable file
//     res.send(buffer);
//   } catch (error) {
//     console.error('Error generating Word document:', error);
//     res.status(500).json({ error: 'Error generating Word document', message: error.message });
//   }
// };

const { promisify } = require("util");
const Docxtemplater = require("docxtemplater");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const inputPath = "test1.docx"; // Path to your Word template
const outputPath = "output.docx"; // Path to save the generated document

exports.generateWordDocument = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    // Find data from the database using requestId
    const data = await procReqest.findOne({ requestId });

    if (!data) {
      return res.status(404).send("Request not found");
    }

    console.log("Data:", data);

    // Read the Word template
    const templateData = await readFileAsync(inputPath, "binary");

    console.log("Template data:", templateData);

    // Initialize the docxtemplater with the template data
    const doc = new Docxtemplater();
    doc.loadZip(templateData);

    // Set the data for placeholders
    doc.setData({
      faculty: data.faculty,
      requestId: data.requestId,
      department: data.department,
      purpose: data.purpose,
      sendTo: data.sendTo,
      // Add other placeholders and corresponding data fields as needed
    });

    // Render the template
    doc.render();

    // Get the rendered document as a binary buffer
    const renderedBuffer = doc.getZip().generate({ type: "nodebuffer" });

    // Write the rendered document to the output path
    await writeFileAsync(outputPath, renderedBuffer);

    // Set response headers for Word download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="output.docx"`);

    // Send the Word document as a downloadable file
    res.sendFile(outputPath);
  } catch (error) {
    console.error("Error generating Word document:", error);
    res.status(500).send("Error creating Word document");
  }
};