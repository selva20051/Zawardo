import React from "react";
import AnimatedGridPattern from '../components/ui/animated-grid-pattern'
import Navbar from '../components/navbar'
import ClassCard from "@/components/classCard";

function Home() {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background pattern with overlay */}
            <div className="absolute inset-0">
                <AnimatedGridPattern 
                    className="opacity-70" 
                    numSquares={100}
                    strokeDasharray={2}
                    maxOpacity={0.7}
                    width={30}
                    height={30}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white" />
            </div>

            {/* Added z-index and relative positioning to make navbar visible */}
            <div className="relative z-10">
                <Navbar />
            </div>
            
            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <div className="text-center">
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                        <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Study Smarter
                        </span>
                        <span className="block mt-2">Learn Together</span>
                    </h1>
                    <p className="mt-6 max-w-md mx-auto text-lg text-gray-600 sm:text-xl md:mt-8 md:max-w-3xl">
                        Join study groups, share resources, and ace your classes with StudyBuddy.
                    </p>
                </div>
            </section>

            {/* Classes Grid */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ClassCard 
                        title="Computer Science 101"
                        description="Introduction to Programming"
                        students={24}
                    />
                    <ClassCard 
                        title="Mathematics 201"
                        description="Calculus II"
                        students={18}
                    />
                    <ClassCard 
                        title="Physics 301"
                        description="Quantum Mechanics"
                        students={15}
                    />
                </div>
            </section>
        </div>
    );
}

export default Home;