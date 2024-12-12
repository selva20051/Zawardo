import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const createClassroom = async (req: Request, res: Response) => {
    const { name } = req.body;
    const teacherId = req.user.id;

    try {
     
        if (req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const classroom = await prisma.classroom.create({
            data: {
                name,
                teacherId
            }
        });

      
        if (classroom) {
            const classroomMember = await prisma.classroomMember.create({
                data: {
                    userId: teacherId,
                    classroomId: classroom.id
                }
            });
            return res.status(201).json({ classroom, classroomMember });
        }

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error creating classroom' });
    }
};


export const joinClassroom = async (req: Request, res: Response) => {
    const { classroomID } = req.params;
    const studentId = req.user.id;

    try {
        
        const classroom = await prisma.classroom.findUnique({
            where: {
                id: parseInt(classroomID),
            }
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        
        const existingMembership = await prisma.classroomMember.findUnique({
            where: {
                userId_classroomId: {
                    userId: studentId,
                    classroomId: parseInt(classroomID)
                }
            }
        });

        if (existingMembership) {
            return res.status(400).json({ message: 'You are already a member of this classroom' });
        }

        
        const classroomMember = await prisma.classroomMember.create({
            data: {
                userId: studentId,
                classroomId: parseInt(classroomID)
            }
        });

        return res.status(201).json(classroomMember);

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Could not join classroom, please try again later' });
    }
};

export const getClassrooms = async (req: Request, res: Response) => {
    const userId = req.user.id;

    try {
        const classrooms = await prisma.classroom.findMany({
            where: {
                OR: [
                    { 
                        teacherId: userId 
                    },
                    { 
                        members: {  
                            some: {
                                userId: userId
                            }
                        }
                    }
                ]
            },
            include: {
                teacher: true, 
                members: true,  
            }
        });

        return res.status(200).json(classrooms);

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Could not retrieve classrooms' });
    }
};

export const getClassroomById = async (req: Request, res: Response) => {
    const userId = req.user.id; 

    try {
        const classroomId = parseInt(req.params.classroomID);

        const classroom = await prisma.classroom.findUnique({
            where: { id: classroomId },
            include: {
                teacher: true,
                members: {
                    include: {
                        user: true
                    }
                },
                tasks: {
                    include: {
                        submissions: {
                            where: {
                                userId: userId 
                            }
                        }
                    }
                }
            }
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        return res.status(200).json(classroom);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Could not retrieve classroom' });
    }
};