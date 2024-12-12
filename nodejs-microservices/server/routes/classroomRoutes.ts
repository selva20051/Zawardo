import express,{Request,Response} from 'express';
import { createClassroom, joinClassroom, getClassrooms, getClassroomById } from '../controller/classroomController.js';
import { authChecker } from '../middleware/authChecker.js';

const router = express.Router();

router.post('/create',authChecker,createClassroom);
router.post('/join/:classroomID',authChecker,joinClassroom);
router.get('/',authChecker,getClassrooms);
router.get('/:classroomID',authChecker,getClassroomById);

export default router;