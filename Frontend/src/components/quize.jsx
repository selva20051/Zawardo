import React, { useState } from "react";
import axios from "axios";

const Quiz = () => {
    const questions = [
        {
            question: "Who developed Python programming language?",
            choices: [
                "Guido van Rossum",
                "James Gosling",
                "Dennis Ritchie",
                "Bjarne Stroustrup"
            ],
            correct_answer: "Guido van Rossum",
            explanation: "Python was created by Guido van Rossum and was first released in 1991.",
            topic: "Python History"
        },
        {
            question: "What is Python's package manager called?",
            choices: [
                "pip",
                "npm",
                "gem",
                "composer"
            ],
            correct_answer: "pip",
            explanation: "pip is the standard package manager for Python used to install and manage packages.",
            topic: "Python Basics"
        },
        {
            question: "Which of these is not a valid variable name in Python?",
            choices: [
                "variable",
                "variable2",
                "2variable",
                "variable_two"
            ],
            correct_answer: "2variable",
            explanation: "Variable names cannot start with numbers in Python.",
            topic: "Variables"
        },
        {
            question: "What is the difference between list and tuple in Python?",
            choices: [
                "Lists are mutable while tuples are immutable",
                "Lists are immutable while tuples are mutable",
                "Both are mutable",
                "Both are immutable"
            ],
            correct_answer: "Lists are mutable while tuples are immutable",
            explanation: "Lists can be modified after creation, while tuples cannot be changed once created.",
            topic: "Data Structures"
        },
        {
            question: "What is the purpose of 'break' statement in Python?",
            choices: [
                "To exit from a loop",
                "To skip the rest of the current loop iteration",
                "To exit from a function",
                "To continue to the next iteration of a loop"
            ],
            correct_answer: "To exit from a loop",
            explanation: "The break statement terminates the loop containing it.",
            topic: "Control Flow"
        },
        {
            question: "What does the 'continue' statement do?",
            choices: [
                "Skips the rest of the current loop iteration",
                "Exits from a loop",
                "Exits from a function",
                "Continues to the next iteration of a loop"
            ],
            correct_answer: "Skips the rest of the current loop iteration",
            explanation: "Continue statement skips the remaining code inside a loop for the current iteration.",
            topic: "Control Flow"
        },
        {
            question: "What is a lambda function in Python?",
            choices: [
                "An anonymous function defined using the lambda keyword",
                "A function defined using the def keyword",
                "A function that returns another function",
                "A function that takes another function as an argument"
            ],
            correct_answer: "An anonymous function defined using the lambda keyword",
            explanation: "Lambda functions are small anonymous functions that can have any number of arguments but only one expression.",
            topic: "Functions"
        },
        {
            question: "What is the difference between args and kwargs?",
            choices: [
                "*args passes variable number of non-keyworded arguments and **kwargs passes keyworded arguments",
                "*args passes keyworded arguments and **kwargs passes non-keyworded arguments",
                "Both *args and **kwargs pass keyworded arguments",
                "Both *args and **kwargs pass non-keyworded arguments"
            ],
            correct_answer: "*args passes variable number of non-keyworded arguments and **kwargs passes keyworded arguments",
            explanation: "*args allows passing multiple arguments, **kwargs allows passing multiple keyword arguments.",
            topic: "Functions"
        },
        {
            question: "What is inheritance in Python?",
            choices: [
                "A way to form new classes using classes that have already been defined",
                "A way to form new functions using functions that have already been defined",
                "A way to form new variables using variables that have already been defined",
                "A way to form new modules using modules that have already been defined"
            ],
            correct_answer: "A way to form new classes using classes that have already been defined",
            explanation: "Inheritance allows a class to inherit attributes and methods from another class.",
            topic: "OOP"
        },
        {
            question: "What is the purpose of __init__ method?",
            choices: [
                "Constructor method for initializing object attributes",
                "Destructor method for cleaning up object attributes",
                "Method for defining class-level attributes",
                "Method for defining instance-level attributes"
            ],
            correct_answer: "Constructor method for initializing object attributes",
            explanation: "__init__ is called automatically when a new object is created from a class.",
            topic: "OOP"
        }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState(Array(questions.length).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [weakTopics, setWeakTopics] = useState({});
    const [showAlert, setShowAlert] = useState(false);

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleChoiceChange = (selectedChoice) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = selectedChoice;
        setAnswers(newAnswers);
        setShowAlert(false);
    };

    const handleSubmit = async () => {
        if (answers.includes(null)) {
            setShowAlert(true);
            return;
        }

        try {
            const response = await axios.post("http://localhost:5001/evaluate", {
                answers: answers.map((answerIndex, questionIndex) => ({
                    question: questions[questionIndex].question,
                    answer: questions[questionIndex].choices[answerIndex]
                }))
            });

            const score = answers.reduce((acc, answer, index) => {
                return acc + (questions[index].choices[answer] === questions[index].correct_answer ? 1 : 0);
            }, 0);

            setResults({
                score,
                total: questions.length,
                details: questions.map((q, i) => ({
                    question: q.question,
                    correct: q.choices[answers[i]] === q.correct_answer,
                    topic: q.topic
                }))
            });

            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            setShowAlert(true);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Python Programming Quiz</h1>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
                <p className="mt-2 text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
            </header>

            {!isSubmitted ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {questions[currentQuestion].question}
                    </h3>
                    <div className="space-y-2">
                        {questions[currentQuestion].choices.map((choice, index) => (
                            <label
                                key={index}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                    answers[currentQuestion] === index 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question_${currentQuestion}`}
                                    checked={answers[currentQuestion] === index}
                                    onChange={() => handleChoiceChange(index)}
                                    className="hidden"
                                />
                                <span>{choice}</span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestion === 0}
                            className="px-4 py-2 text-gray-600 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {currentQuestion === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                            >
                                Submit Quiz
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
                    <p className="text-lg mb-4">
                        Score: {results.score} / {results.total}
                    </p>
                    <div className="mt-6">
                        <h3 className="font-medium mb-2">Question Summary:</h3>
                        {results.details.map((detail, index) => (
                            <div 
                                key={index}
                                className={`p-4 rounded-lg mb-2 ${
                                    detail.correct ? 'bg-green-50' : 'bg-red-50'
                                }`}
                            >
                                <p className="font-medium">{detail.question}</p>
                                <p className={detail.correct ? 'text-green-600' : 'text-red-600'}>
                                    {detail.correct ? 'Correct' : 'Incorrect'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showAlert && (
                <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                    Please answer the current question before proceeding.
                </div>
            )}
        </div>
    );
};

export default Quiz;