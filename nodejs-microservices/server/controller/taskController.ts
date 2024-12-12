import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTask = async (req: Request, res: Response) => {
    const { description, dueDate } = req.body;
    const { classroomID } = req.params;
    const teacherId = req.user.id;
    try {
        const classroom = await prisma.classroom.findUnique({
            where: { id: parseInt(classroomID) }
        });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        const task = await prisma.task.create({
            data: {
                description,
                dueDate: new Date(dueDate),
                classroomId: parseInt(classroomID),
                assignedBy: teacherId,
            }
        });
        return res.status(201).json(task);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error creating task' });
    }
};

export const getAllTasks = async (req: Request, res: Response) => {
    const userId = req.user.id;
    try {
        const tasks = await prisma.task.findMany({
            where: {
                classroom: {
                    members: {
                        some: {
                            userId: userId
                        }
                    }
                }
            },
            include: {
                classroom: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error retrieving tasks' });
    }

};

export const editTask = async (req: Request, res: Response) => {
    const { description, dueDate } = req.body;
    const { taskID } = req.params;
    const teacherId = req.user.id;
    try {
        const task = await prisma.task.findUnique({
            where: { id: parseInt(taskID) }
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.assignedBy !== teacherId) {
            return res.status(401).json({ message: 'You are not authorized to edit this task' });
        }
        const updatedTask = await prisma.task.update({
            where: { id: parseInt(taskID) },
            data: {
                description,
                dueDate: new Date(dueDate),
            }
        });
        return res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error updating task' });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    const { taskID } = req.params;
    console.log(taskID);
    const teacherId = req.user.id;
    try {
        const task = await prisma.task.findUnique({
            where: { id: parseInt(taskID) }
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.assignedBy !== teacherId) {
            return res.status(401).json({ message: 'You are not authorized to delete this task' });
        }
        await prisma.task.delete({
            where: { id: parseInt(taskID) }
        });
        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error deleting task' });
    }
};

export const submitAssignment = async (req: Request, res: Response) => {
    const { taskID } = req.params;
    const userId = req.user.id;
    const { fileUrl } = req.body;

    if (!taskID) return res.status(400).json({ message: 'Missing taskId' });

    if (!fileUrl) {
        return res.status(400).json({ message: 'Missing fileUrl' });
    } 

    try {
        const submission = await prisma.submission.create({
            data: {
                fileUrl,
                taskId: parseInt(taskID),
                userId
            }
        });
        return res.status(201).json(submission);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error submitting assignment' }); 
    }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
    const { taskID } = req.params;
    try {
        const submissions = await prisma.submission.findMany({
            where: {
                taskId: parseInt(taskID)
                
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
        }
    });
        return res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error retrieving submissions' });
    }
};

export const editSubmission = async (req: Request, res: Response) => {
    const { submissionID } = req.params;
    const { fileUrl } = req.body;
    try {
        const submission = await prisma.submission.update({
            where: { id: parseInt(submissionID) },
            data: {
                fileUrl
            }
        });
        return res.status(200).json(submission);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error updating submission' });
    }
};