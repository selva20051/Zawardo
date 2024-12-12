import React, { useState, useEffect } from "react";
import axios from "axios";

const Quiz = () => {
    const questions = [
        {
            question: "What is the correct way to create a virtual environment in Python?",
            choices: [
                "python -m venv myenv",
                "pip install venv",
                "python virtualenv create myenv",
                "python venv create myenv"
            ],
            correct_answer: "python -m venv myenv",
            explanation: "The `venv` module is used to create virtual environments in Python by using the command `python -m venv <env_name>`.",
            topic: "Python Basics"
        },
        {
            question: "Which data type is immutable in Python?",
            choices: ["List", "Dictionary", "String", "Set"],
            correct_answer: "String",
            explanation: "Strings are immutable in Python, meaning their contents cannot be changed after creation.",
            topic: "Data Types"
        },
        {
            question: "What will be the output of the following code?\n\n```python\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)\n```",
            choices: [
                "[1, 2, 3]",
                "[1, 2, 3, 4]",
                "Error: append() is not a method of list",
                "[4]"
            ],
            correct_answer: "[1, 2, 3, 4]",
            explanation: "In Python, lists are mutable and passed by reference. Modifying `y` also affects `x` since they refer to the same object.",
            topic: "Data Structures"
        },
        {
            question: "What does the `len()` function do in Python?",
            choices: [
                "Returns the size of a variable in bytes",
                "Returns the length of an iterable",
                "Returns the maximum value in a list",
                "Returns the type of a variable"
            ],
            correct_answer: "Returns the length of an iterable",
            explanation: "`len()` returns the number of items in an iterable, such as a string, list, or dictionary.",
            topic: "Built-in Functions"
        },
        {
            question: "What is a decorator in Python?",
            choices: [
                "A function that takes another function as argument and extends its behavior",
                "A class that inherits from another class",
                "A function that returns multiple values",
                "A type of loop in Python"
            ],
            correct_answer: "A function that takes another function as argument and extends its behavior",
            explanation: "Decorators are functions that modify the behavior of another function without changing its source code.",
            topic: "Advanced Functions"
        },
        {
            question: "What is the purpose of __init__ method?",
            choices: [
                "To initialize class attributes",
                "To create a new class",
                "To delete an object",
                "To import modules"
            ],
            correct_answer: "To initialize class attributes",
            explanation: "The __init__ method is called when an object is created and is used to initialize attributes.",
            topic: "OOP"
        },
        {
            question: "How do you open a file in write mode?",
            choices: [
                "open('file.txt', 'w')",
                "open('file.txt', 'r')",
                "read('file.txt')",
                "write('file.txt')"
            ],
            correct_answer: "open('file.txt', 'w')",
            explanation: "The 'w' mode opens a file for writing, creating a new file if it doesn't exist.",
            topic: "File Handling"
        },
        {
            question: "What is a list comprehension?",
            choices: [
                "A shorter syntax to create lists based on existing lists",
                "A way to sort lists",
                "A method to combine multiple lists",
                "A function to count list items"
            ],
            correct_answer: "A shorter syntax to create lists based on existing lists",
            explanation: "List comprehensions provide a concise way to create lists based on existing lists or iterables.",
            topic: "List Operations"
        },
        {
            question: "What does the 'try-except' block do?",
            choices: [
                "Handles exceptions in code",
                "Creates a new function",
                "Defines a loop",
                "Imports modules"
            ],
            correct_answer: "Handles exceptions in code",
            explanation: "Try-except blocks are used for exception handling in Python to handle runtime errors gracefully.",
            topic: "Exception Handling"
        },
        {
            question: "What is a lambda function?",
            choices: [
                "An anonymous function defined using lambda keyword",
                "A function that always returns True",
                "A type of class in Python",
                "A built-in math function"
            ],
            correct_answer: "An anonymous function defined using lambda keyword",
            explanation: "Lambda functions are small anonymous functions that can have any number of arguments but only one expression.",
            topic: "Functions"
        },
        {
            question: "How do you get all keys from a dictionary?",
            choices: [
                "dict.keys()",
                "dict.get()",
                "dict.values()",
                "dict.items()"
            ],
            correct_answer: "dict.keys()",
            explanation: "The keys() method returns a view object containing all keys in the dictionary.",
            topic: "Dictionaries"
        },
        {
            question: "What is the purpose of 'self' in class methods?",
            choices: [
                "References the instance of the class",
                "Creates a new class",
                "Defines a static method",
                "Imports class attributes"
            ],
            correct_answer: "References the instance of the class",
            explanation: "'self' is a convention used to refer to the instance of the class within class methods.",
            topic: "OOP"
        },
        {
            question: "How do you import a specific function from a module?",
            choices: [
                "from module import function",
                "import module.function",
                "using module.function",
                "get function from module"
            ],
            correct_answer: "from module import function",
            explanation: "The 'from...import' statement allows importing specific functions from modules.",
            topic: "Modules"
        },
        {
            question: "What is string slicing in Python?",
            choices: [
                "Extracting parts of a string using index ranges",
                "Converting string to list",
                "Joining two strings",
                "Finding string length"
            ],
            correct_answer: "Extracting parts of a string using index ranges",
            explanation: "String slicing allows you to extract portions of a string using index ranges [start:end:step].",
            topic: "Strings"
        }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState(Array(questions.length).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [weakTopics, setWeakTopics] = useState({});
    const [showAlert, setShowAlert] = useState(false);
    const [videos, setVideos] = useState([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);

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

    const fetchRecommendedVideos = async (topics) => {
        setIsLoadingVideos(true);
        try {
            const response = await axios.post("http://localhost:5001/api/videos", {
                query: `python tutorial ${topics.join(' ')}`,
                max_results: 5
            });
            setVideos(response.data.videos);
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setIsLoadingVideos(false);
        }
    };

    const handleSubmit = async () => {
        if (answers.includes(null)) {
            setShowAlert(true);
            return;
        }

        try {
            // Local evaluation
            const evaluatedResults = answers.map((answerIndex, index) => {
                const question = questions[index];
                const isCorrect = question.choices[answerIndex] === question.correct_answer;
                
                return {
                    question: question.question,
                    status: isCorrect ? "Correct" : "Incorrect",
                    explanation: question.explanation,
                    correct_answer: question.correct_answer,
                    topic: question.topic
                };
            });

            // Calculate weak topics
            const topicErrors = evaluatedResults.reduce((acc, result) => {
                if (result.status === "Incorrect") {
                    acc[result.topic] = (acc[result.topic] || 0) + 1;
                }
                return acc;
            }, {});

            setResults({
                score: evaluatedResults.filter(r => r.status === "Correct").length,
                total: questions.length,
                details: evaluatedResults
            });

            setWeakTopics(topicErrors);
            setIsSubmitted(true);

            // Only fetch videos if there are weak topics
            if (Object.keys(topicErrors).length > 0) {
                await fetchRecommendedVideos(Object.keys(topicErrors));
            }
        } catch (error) {
            console.error("Error evaluating quiz:", error);
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
                    
                    {Object.entries(weakTopics).length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-medium mb-2">Topics to Review:</h3>
                            <ul className="list-disc list-inside">
                                {Object.entries(weakTopics).map(([topic, count]) => (
                                    <li key={topic} className="text-red-600">
                                        {topic}: {count} incorrect
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="font-medium mb-2">Question Summary:</h3>
                        {results.details.map((detail, index) => (
                            <div 
                                key={index}
                                className={`p-4 rounded-lg mb-4 ${
                                    detail.status === "Correct" ? 'bg-green-50' : 'bg-red-50'
                                }`}
                            >
                                <p className="font-medium">{detail.question}</p>
                                <p className={detail.status === "Correct" ? 'text-green-600' : 'text-red-600'}>
                                    {detail.status}
                                </p>
                                {detail.status === "Incorrect" && (
                                    <>
                                        <p className="mt-2 text-gray-700">
                                            Correct Answer: {detail.correct_answer}
                                        </p>
                                        <p className="mt-1 text-gray-600">
                                            {detail.explanation}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isSubmitted && videos.length > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Recommended Videos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((video, index) => (
                            <a
                                key={index}
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block hover:transform hover:scale-105 transition-all duration-300"
                            >
                                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 line-clamp-2">
                                            {video.title}
                                        </h3>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {isLoadingVideos && (
                <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading recommendations...</p>
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