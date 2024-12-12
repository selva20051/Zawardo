import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTodo = async (req:Request, res:Response) => {
    const  userId  = req.user.id;
    const { description } = req.body;

    if(req.user.role !== 'USER') {
        return res.status(403).json({ message: 'Only students can create todos' });
    }

    try {
        const todo = await prisma.todo.create({
            data: {
                description,
                userId
            }
        });
        return res.status(201).json(todo);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error creating todo' });
    }
}

export const getAllTodos = async (req:Request, res:Response) => {
    const { userId } = req.user.id;

    try {
        const todos = await prisma.todo.findMany({
            where: {
                userId
            }
        });
        return res.status(200).json(todos);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error retrieving todos' });
    }
}

export const updateTodo = async (req:Request, res:Response) => {
    const { todoId } = req.params;
    const { description } = req.body;

    try {
        const todo = await prisma.todo.findUnique({
            where: {
                id: parseInt(todoId)
            }
        });

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const updatedTodo = await prisma.todo.update({
            where: {
                id: parseInt(todoId)
            },
            data: {
                description
            }
        });
        return res.status(200).json(updatedTodo);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error updating todo' });
    }
}

export const todoDone = async (req:Request, res:Response) => {
    const { todoId } = req.params;

    try {
        const todo = await prisma.todo.findUnique({
            where: {
                id: parseInt(todoId)
            }
        });

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const updatedTodo = await prisma.todo.update({
            where: {
                id: parseInt(todoId)
            },
            data: {
                isCompleted: true
            }
        });
        return res.status(200).json(updatedTodo);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error updating todo' });
    }
};

export const deleteTodo = async (req:Request, res:Response) => {
    const { todoId } = req.params;

    try {
        const todo = await prisma.todo.findUnique({
            where: {
                id: parseInt(todoId)
            }
        });

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        await prisma.todo.delete({
            where: {
                id: parseInt(todoId)
            }
        });
        return res.status(200).json({ message: 'Todo deleted' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error deleting todo' });
    }
};