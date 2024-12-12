import express from 'express';
import { createTodo, getAllTodos, updateTodo, deleteTodo, todoDone } from '../controller/todoController.js';
import { authChecker } from '../middleware/authChecker.js';

const router = express.Router();

router.post('/', authChecker ,createTodo);
router.get('/', authChecker ,getAllTodos);
router.put('/:todoId', authChecker ,updateTodo);
router.get('/:todoId/done', authChecker ,todoDone);
router.delete('/:todoId', authChecker ,deleteTodo);

export default router;