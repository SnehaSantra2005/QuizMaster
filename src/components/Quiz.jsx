
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

import Result from "./Result";

function Quiz() {
    const { category } = useParams();
    const [searchParams] = useSearchParams();

    const quizAttemptId = useRef(crypto.randomUUID());

    const difficulty = searchParams.get("difficulty");

    // MongoDB questions
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);

    /*
      Fetch questions from MongoDB
    */
    useEffect(() => {
        const controller = new AbortController();

        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError("");
                setQuestions([]);

                const response = await fetch(
                    `http://localhost:5000/api/questions?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty || "")}`,
                    { signal: controller.signal }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to fetch questions."
                    );
                }

                setQuestions(data.questions || []);

                // Reset quiz when category or difficulty changes
                setCurrentQuestion(0);
                setSelectedAnswer("");
                setScore(0);
                setQuizFinished(false);
                setTimeLeft(120);

                quizAttemptId.current = crypto.randomUUID();

            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Question fetch error:", err);
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        if (category && difficulty) {
            fetchQuestions();
        } else {
            setError("Invalid category or difficulty.");
            setLoading(false);
        }

        return () => controller.abort();

    }, [category, difficulty]);

    /*
      Shuffle questions
    */
    const shuffledQuestions = useMemo(() => {
        return [...questions].sort(
            () => Math.random() - 0.5
        );
    }, [questions]);

    /*
      Timer
    */
    useEffect(() => {
        if (loading || quizFinished) {
            return;
        }

        if (timeLeft <= 0) {
            setQuizFinished(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((previousTime) => previousTime - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [timeLeft, quizFinished, loading]);

    /*
      Loading screen
    */
    if (loading) {
        return (
            <div className="quiz-error-page">
                <div className="quiz-error-card">
                    <div className="quiz-error-icon">⏳</div>
                    <h2>Loading Quiz...</h2>
                    <p>Please wait while we prepare your questions.</p>
                </div>
            </div>
        );
    }

    /*
      Error screen
    */
    if (error) {
        return (
            <div className="quiz-error-page">
                <div className="quiz-error-card">
                    <div className="quiz-error-icon">⚠️</div>
                    <h2>Unable to Load Quiz</h2>
                    <p>{error}</p>

                    <Link to={`/difficulty/${category}`}>
                        <button className="start-btn">
                            Go Back
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    /*
      Safety check
    */
    if (shuffledQuestions.length === 0) {
        return (
            <div className="quiz-error-page">
                <div className="quiz-error-card">

                    <div className="quiz-error-icon">
                        😕
                    </div>

                    <h2>No Questions Found</h2>

                    <p>
                        No questions are available for this
                        difficulty level.
                    </p>

                    <Link to={`/difficulty/${category}`}>
                        <button className="start-btn">
                            Choose Another Level
                        </button>
                    </Link>

                </div>
            </div>
        );
    }

    /*
      Current question
    */
    const question = shuffledQuestions[currentQuestion];

    /*
      Progress
    */
    const progress =
        ((currentQuestion + 1) / shuffledQuestions.length) * 100;

    /*
      Timer formatting
    */
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const formattedTime =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    /*
      Category names
    */
    const categoryName = {
        programming: "Programming",
        dbms: "DBMS",
        web: "Web Development",
        ml: "Machine Learning",
        java: "Java",
        python: "Python",
        dsa: "Data Structures",
        os: "Operating Systems",
        cn: "Computer Networks",
        cybersecurity: "Cyber Security",
        datascience: "Data Science",
        aptitude: "Aptitude"
    };

    /*
      Answer handler
    */
    const handleAnswer = (option) => {
        if (selectedAnswer || quizFinished) {
            return;
        }

        setSelectedAnswer(option);

        if (option === question.answer) {
            setScore((previousScore) => previousScore + 1);
        }
    };

    /*
      Next question
    */
    const handleNext = () => {
        if (!selectedAnswer) {
            return;
        }

        if (currentQuestion < shuffledQuestions.length - 1) {
            setCurrentQuestion((previousQuestion) => previousQuestion + 1);
            setSelectedAnswer("");
        } else {
            setQuizFinished(true);
        }
    };

    /*
      Result page
    */
    if (quizFinished) {
        return (
            <Result
                score={score}
                total={shuffledQuestions.length}
                category={category}
                difficulty={difficulty}
                attemptId={quizAttemptId.current}
            />
        );
    }

    /*
      Answer styling
    */
    const getOptionClass = (option) => {
        if (!selectedAnswer) {
            return "quiz-option";
        }

        if (option === question.answer) {
            return "quiz-option correct";
        }

        if (
            option === selectedAnswer &&
            option !== question.answer
        ) {
            return "quiz-option wrong";
        }

        return "quiz-option disabled";
    };

    return (
        <div className="quiz-page">

            {/* TOP BAR */}

            <div className="quiz-topbar">

                <Link
                    to={`/difficulty/${category}`}
                    className="quiz-exit"
                >
                    ← Exit Quiz
                </Link>

                <div className="quiz-brand">
                    <span>Q</span>
                    QuizMaster
                </div>

                <div
                    className={
                        timeLeft <= 20
                            ? "quiz-timer danger"
                            : "quiz-timer"
                    }
                >
                    <span>⏱</span>
                    {formattedTime}
                </div>

            </div>

            {/* QUIZ HEADER */}

            <div className="quiz-main">

                <div className="quiz-heading">

                    <div>

                        <p className="quiz-category">
                            {categoryName[category] || category}
                        </p>

                        <h1>
                            {difficulty} Challenge
                        </h1>

                    </div>

                    <div className="question-count">
                        <strong>
                            {String(currentQuestion + 1).padStart(2, "0")}
                        </strong>

                        <span>
                            / {String(shuffledQuestions.length).padStart(2, "0")}
                        </span>
                    </div>

                </div>

                {/* Progress */}

                <div className="quiz-progress-container">

                    <div className="quiz-progress-info">

                        <span>
                            Question {currentQuestion + 1} of{" "}
                            {shuffledQuestions.length}
                        </span>

                        <span>
                            {Math.round(progress)}%
                        </span>

                    </div>

                    <div className="quiz-progress-bar">

                        <div
                            className="quiz-progress-fill"
                            style={{
                                width: `${progress}%`
                            }}
                        ></div>

                    </div>

                </div>

                {/* QUESTION CARD */}

                <div className="quiz-question-card">

                    <div className="question-label">
                        QUESTION {String(currentQuestion + 1).padStart(2, "0")}
                    </div>

                    <h2>
                        {question.question}
                    </h2>

                    {/* Options */}

                    <div className="quiz-options">

                        {question.options.map((option, index) => (

                            <button
                                key={option}
                                className={getOptionClass(option)}
                                onClick={() => handleAnswer(option)}
                                disabled={Boolean(selectedAnswer)}
                            >

                                <span className="option-letter">
                                    {String.fromCharCode(65 + index)}
                                </span>

                                <span className="option-text">
                                    {option}
                                </span>

                                {selectedAnswer &&
                                    option === question.answer && (
                                        <span className="option-status">
                                            ✓
                                        </span>
                                    )}

                                {selectedAnswer &&
                                    option === selectedAnswer &&
                                    option !== question.answer && (
                                        <span className="option-status">
                                            ×
                                        </span>
                                    )}

                            </button>

                        ))}

                    </div>

                    {/* Bottom */}

                    <div className="quiz-card-bottom">

                        <div className="quiz-tip">
                            💡
                            <span>
                                Take your time and think carefully.
                            </span>
                        </div>

                        <button
                            className="quiz-next-btn"
                            onClick={handleNext}
                            disabled={!selectedAnswer}
                        >
                            {currentQuestion === shuffledQuestions.length - 1
                                ? "Finish Quiz"
                                : "Next Question"}

                            <span>→</span>
                        </button>

                    </div>

                </div>

                {/* Difficulty badge */}

                <div className="quiz-footer-info">

                    <span>
                        ✦ {difficulty} difficulty
                    </span>

                    <span>•</span>

                    <span>
                        {shuffledQuestions.length} questions
                    </span>

                </div>

            </div>

        </div>
    );
}

export default Quiz;
