const quizzes = {

    programming: [
        {
            id: 1,
            question: "Which language is used to create Android applications?",
            options: ["Java", "HTML", "CSS", "SQL"],
            answer: "Java",
            difficulty: "Easy"
        },

        {
            id: 2,
            question: "Which keyword is used to create a class in Java?",
            options: ["class", "Class", "create", "object"],
            answer: "class",
            difficulty: "Easy"
        },

        {
            id: 3,
            question: "Which data structure follows FIFO?",
            options: ["Stack", "Queue", "Tree", "Graph"],
            answer: "Queue",
            difficulty: "Medium"
        },

        {
            id: 4,
            question: "Which language is mainly used for system programming?",
            options: ["C", "HTML", "CSS", "SQL"],
            answer: "C",
            difficulty: "Medium"
        },

        {
            id: 5,
            question: "Which of these is an OOP concept?",
            options: [
                "Encapsulation",
                "Compilation",
                "Execution",
                "Debugging"
            ],
            answer: "Encapsulation",
            difficulty: "Hard"
        }
    ],


    dbms: [
        {
            id: 1,
            question: "What does DBMS stand for?",
            options: [
                "Database Management System",
                "Data Backup Management System",
                "Database Machine System",
                "Data Management Software"
            ],
            answer: "Database Management System",
            difficulty: "Easy"
        },

        {
            id: 2,
            question: "Which language is used to communicate with databases?",
            options: ["SQL", "HTML", "CSS", "Java"],
            answer: "SQL",
            difficulty: "Easy"
        },

        {
            id: 3,
            question: "Which key uniquely identifies a record?",
            options: [
                "Foreign Key",
                "Primary Key",
                "Candidate Key",
                "Composite Key"
            ],
            answer: "Primary Key",
            difficulty: "Medium"
        },

        {
            id: 4,
            question: "What is used to remove duplicate rows?",
            options: ["UNIQUE", "DISTINCT", "REMOVE", "DELETE"],
            answer: "DISTINCT",
            difficulty: "Medium"
        },

        {
            id: 5,
            question: "Which command is used to retrieve data?",
            options: ["SELECT", "INSERT", "UPDATE", "DELETE"],
            answer: "SELECT",
            difficulty: "Hard"
        }
    ],


    web: [
        {
            id: 1,
            question: "What does HTML stand for?",
            options: [
                "Hyper Text Markup Language",
                "High Text Machine Language",
                "Hyper Tool Markup Language",
                "Home Text Markup Language"
            ],
            answer: "Hyper Text Markup Language",
            difficulty: "Easy"
        },

        {
            id: 2,
            question: "Which language is used for styling web pages?",
            options: ["HTML", "CSS", "Java", "SQL"],
            answer: "CSS",
            difficulty: "Easy"
        },

        {
            id: 3,
            question: "Which language adds interactivity to webpages?",
            options: ["CSS", "HTML", "JavaScript", "SQL"],
            answer: "JavaScript",
            difficulty: "Medium"
        },

        {
            id: 4,
            question: "Which HTML tag is used to create a link?",
            options: ["<a>", "<link>", "<href>", "<url>"],
            answer: "<a>",
            difficulty: "Medium"
        },

        {
            id: 5,
            question: "Which symbol is used for an ID selector in CSS?",
            options: [".", "#", "*", "&"],
            answer: "#",
            difficulty: "Hard"
        }
    ],


    ml: [
        {
            id: 1,
            question: "What does ML stand for?",
            options: [
                "Machine Learning",
                "Modern Language",
                "Machine Logic",
                "Model Learning"
            ],
            answer: "Machine Learning",
            difficulty: "Easy"
        },

        {
            id: 2,
            question: "Which is a supervised learning algorithm?",
            options: [
                "Linear Regression",
                "K-Means",
                "PCA",
                "Apriori"
            ],
            answer: "Linear Regression",
            difficulty: "Easy"
        },

        {
            id: 3,
            question: "Which algorithm is used for clustering?",
            options: [
                "Linear Regression",
                "K-Means",
                "Logistic Regression",
                "Naive Bayes"
            ],
            answer: "K-Means",
            difficulty: "Medium"
        },

        {
            id: 4,
            question: "Which algorithm is commonly used for classification?",
            options: [
                "Logistic Regression",
                "K-Means",
                "PCA",
                "Apriori"
            ],
            answer: "Logistic Regression",
            difficulty: "Medium"
        },

        {
            id: 5,
            question: "What is the full form of PCA?",
            options: [
                "Principal Component Analysis",
                "Primary Component Algorithm",
                "Principal Classification Analysis",
                "Primary Classification Algorithm"
            ],
            answer: "Principal Component Analysis",
            difficulty: "Hard"
        }
    ],

    java: [
        {
            id: 1,
            question: "Which keyword is used to inherit a class in Java?",
            options: ["implements", "extends", "inherits", "super"],
            answer: "extends",
            difficulty: "Easy"
        },
        {
            id: 2,
            question: "Which concept allows the same method name with different parameters?",
            options: ["Inheritance", "Encapsulation", "Method Overloading", "Abstraction"],
            answer: "Method Overloading",
            difficulty: "Medium"
        },
        {
            id: 3,
            question: "Which keyword prevents a class from being inherited?",
            options: ["static", "private", "final", "void"],
            answer: "final",
            difficulty: "Hard"
        }
    ],

    python: [
        {
            id: 1,
            question: "Which symbol is used to start a comment in Python?",
            options: ["//", "#", "/*", "--"],
            answer: "#",
            difficulty: "Easy"
        },
        {
            id: 2,
            question: "Which data type stores key-value pairs in Python?",
            options: ["List", "Tuple", "Dictionary", "Set"],
            answer: "Dictionary",
            difficulty: "Medium"
        },
        {
            id: 3,
            question: "What does len([10, 20, 30]) return?",
            options: ["2", "3", "10", "30"],
            answer: "3",
            difficulty: "Hard"
        }
    ],

    dsa: [
        {
            id: 1,
            question: "Which data structure follows LIFO?",
            options: ["Queue", "Stack", "Linked List", "Graph"],
            answer: "Stack",
            difficulty: "Easy"
        },
        {
            id: 2,
            question: "What is the time complexity of binary search on a sorted array?",
            options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
            answer: "O(log n)",
            difficulty: "Medium"
        },
        {
            id: 3,
            question: "Which data structure is commonly used in BFS?",
            options: ["Stack", "Queue", "Heap", "Hash Set"],
            answer: "Queue",
            difficulty: "Hard"
        }
    ],

    os: [
        {
            id: 1,
            question: "What is the main role of an operating system?",
            options: [
                "Manage computer resources",
                "Design websites",
                "Create databases only",
                "Compile every language"
            ],
            answer: "Manage computer resources",
            difficulty: "Easy"
        },
        {
            id: 2,
            question: "Which scheduling algorithm uses a fixed time quantum?",
            options: ["FCFS", "SJF", "Round Robin", "Priority only"],
            answer: "Round Robin",
            difficulty: "Medium"
        },
        {
            id: 3,
            question: "Which condition is necessary for deadlock?",
            options: [
                "Circular wait",
                "Compilation",
                "Caching",
                "Paging only"
            ],
            answer: "Circular wait",
            difficulty: "Hard"
        }
    ],

    cn: [
        {
            id: 1,
            question: "How many layers are there in the OSI model?",
            options: ["4", "5", "7", "8"],
            answer: "7",
            difficulty: "Easy"
        },
        {
            id: 2,
            question: "Which protocol is commonly used for secure web browsing?",
            options: ["HTTP", "HTTPS", "FTP", "SMTP"],
            answer: "HTTPS",
            difficulty: "Medium"
        },
        {
            id: 3,
            question: "Which transport protocol provides reliable, connection-oriented communication?",
            options: ["UDP", "IP", "TCP", "ARP"],
            answer: "TCP",
            difficulty: "Hard"
        }
    ],

    cybersecurity: [
        {
            id: 1,
            question: "What is phishing?",
            options: [
                "A method of tricking users into revealing sensitive information",
                "A data compression technique",
                "A programming language",
                "A backup method"
            ],
            answer: "A method of tricking users into revealing sensitive information",
            difficulty: "Easy"
        },
        {
            id: 2,
            question: "What is the primary purpose of encryption?",
            options: [
                "Increase screen brightness",
                "Protect information by encoding it",
                "Delete duplicate files",
                "Speed up a processor"
            ],
            answer: "Protect information by encoding it",
            difficulty: "Medium"
        },
        {
            id: 3,
            question: "Which security principle means granting only necessary permissions?",
            options: [
                "Open access",
                "Least privilege",
                "Full disclosure",
                "Data duplication"
            ],
            answer: "Least privilege",
            difficulty: "Hard"
        }
    ],

    datascience: [
        {
            id: 1,
            question: "Which Python library is widely used for tabular data analysis?",
            options: ["Pandas", "Pygame", "Turtle", "Tkinter"],
            answer: "Pandas",
            difficulty: "Easy"
        },
        {
            id: 2,
            question: "What does the median represent?",
            options: [
                "The largest value",
                "The middle value in ordered data",
                "The sum of all values",
                "The most frequent value only"
            ],
            answer: "The middle value in ordered data",
            difficulty: "Medium"
        },
        {
            id: 3,
            question: "What is the main purpose of splitting data into training and test sets?",
            options: [
                "To evaluate performance on unseen data",
                "To remove every feature",
                "To guarantee 100% accuracy",
                "To increase the number of labels"
            ],
            answer: "To evaluate performance on unseen data",
            difficulty: "Hard"
        }
    ],

    aptitude: [
        {
            id: 1,
            question: "What is 20% of 150?",
            options: ["20", "25", "30", "35"],
            answer: "30",
            difficulty: "Easy"
        },
        {
            id: 2,
            question: "An item costs ₹500 and is sold for ₹600. What is the profit percentage?",
            options: ["10%", "15%", "20%", "25%"],
            answer: "20%",
            difficulty: "Medium"
        },
        {
            id: 3,
            question: "The ratio of two numbers is 2:3 and their sum is 40. What is the larger number?",
            options: ["16", "20", "24", "30"],
            answer: "24",
            difficulty: "Hard"
        }
    ]


};

export default quizzes;