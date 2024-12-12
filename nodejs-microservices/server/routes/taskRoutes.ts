import express from 'express';
import { createTask, getAllTasks, editTask, deleteTask, submitAssignment, getAllSubmissions, editSubmission } from '../controller/taskController.js';
import { authChecker } from '../middleware/authChecker.js';

const router = express.Router();
router.post('/create/:classroomID', authChecker,createTask);
router.get('/', authChecker,getAllTasks);
router.put('/:taskID', authChecker,editTask);
router.delete('/:taskID', authChecker,deleteTask);
router.post('/submit/:taskID', authChecker,submitAssignment);
router.get('/submissions/:taskID', authChecker,getAllSubmissions);
router.put('/submissions/:submissionID', authChecker,editSubmission);

export default router;