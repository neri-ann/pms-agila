const router = require('express').Router();
const { 
  generateRequestId,
  createRequest,
  deleteRequest,
  addProcItem,
  deleteProcItem,
  uploadFile,
  downloadFile,
  deleteFile,
  viewFiles,
  viewAllRequests,
  viewRequestsByDepartment,
  viewRequestById,
  viewRequestFilesAndSpecs,
  veiwProcItems,
  SpecificationFile,
  uploadSpecificationFile,
  uploadSpecification,
  getTokenStatus,
  initializeGoogleDrive
} = require('../controllers/procReqest');
const upload = require('../middlewares/multer');
const specification = require('../middlewares/specificationMulter');

const { isAuthenticated } = require('../middlewares/auth');

router.post("/generateRequestId", generateRequestId, (req, res) => {
    console.log("Received a request to create a REQ id:", req.body);
    generateRequestId(req, res);
  });
  router.post("/createRequest/:requestId", createRequest, (req, res) => {
    console.log("Received a request to create a procurement request:", req.body);
    createRequest(req, res);
  });
  router.get('/viewRequests/' ,viewAllRequests);
  router.get('/viewRequest/:requestId', viewRequestById);
  router.get('/viewRequestFiles/:requestId', viewRequestFilesAndSpecs);
  router.delete('/deleteRequest/:requestId',deleteRequest);
  router.post('/addProcItem/:requestId',addProcItem);
  router.get('/viewProcItems/:requestId',veiwProcItems);
  router.delete('/deleteProcItem/:requestId/:itemId', deleteProcItem);
  router.post('/uploadFile/:requestId', upload.single('file'), uploadFile);
  router.post('/uploadSpecification/:requestId', specification.single('specification'), uploadSpecification);

  router.get('/downloadFile/:requestId/:id', downloadFile); 
  router.delete('/deleteFile/:requestId/:id', deleteFile);
  router.get('/viewFiles', viewFiles);
  
  // New Google Drive management endpoints
  router.get('/google-drive/status', getTokenStatus);
  router.post('/google-drive/initialize', initializeGoogleDrive);
  
  // router.get('/downloadPdf/:requestId', downloadPdf);
  router.get("/viewRequestsByDepartment/:id", viewRequestsByDepartment);



  module.exports = router;


  


  