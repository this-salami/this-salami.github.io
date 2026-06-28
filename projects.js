const projects = [
    { // TODO: add video demo
        name: "Fidget Game",
        descriptionTeaser: "One of my first projects, a simple game which garnered 50,000 plays on Roblox.", // TODO: get data
        link: "https://www.roblox.com/games/6596879170/Fidget-Game-Beta#!/about",
        time: [[new Date("2020-12-01"), new Date("2021-07-01")]],
        tags: ["lua", "game-design", "ui", "video-demo"]
    },
    { // TODO: find more of my python macros & make video demo
        name: "Python Autoclicker",
        descriptionTeaser: "A simple Python script that automates mouse clicks.",
        link: "https://github.com/this-salami/python-macros/tree/main/Autoclicker",
        time: [[new Date("2022-06-01")]],
        tags: ["python", "open-source", "video-demo"] // TODO: add demo
    },
    { // TODO: add video demo
        name: "Python Piano Tiles Bot",
        descriptionTeaser: "A bot that plays the popular Piano Tiles game automatically using Python.",
        link: "https://github.com/this-salami/python-macros/tree/main/MusicalTiles",
        time: [[new Date("2023-02-01")]],
        tags: ["python", "open-source", "video-demo"] // TODO: add demo
    },
    { // TODO: add video demo & documentation
        name: "Minesweeper Bookmarklet",
        descriptionTeaser: "A bookmarklet that allows you to solve minesweeper puzzles automatically.",
        link: "https://github.com/this-salami/minesweeper-bookmarklet",
        time: [[new Date("2023-02-01"), new Date("2023-04-01")]], // TODO: Find out exact dates
        tags: ["js", "open-source", "video-demo"] // TODO: add demo
    },
    { // TODO: add pages & repo
        name: "Isometric Map Test",
        descriptionTeaser: "Isometric map test inspired by classic isometric games, showcasing tile-based rendering and movement.", // TODO: add data
        link: "https://github.com/this-salami/Isometric-Map-Test-2025",
        time: [[new Date("2024-09-01"), new Date("2024-11-01")]], // TODO: Find out exact dates
        tags: ["js", "open-source", "video-demo"] // TODO: add demo
    },
    { // TODO: add pages & repo
        name: "Chess.com Python API",
        descriptionTeaser: "Assignment in Highschool coding class, uses Chess.com API to fetch player data.",
        link: "", // TODO: add link
        time: [[new Date("2024-09-01")]], 
        tags: ["python", "open-source", "video-demo"] // TODO: add demo
    },
    { // TODO: add pages & repo
        name: "Python Wordle Game",
        descriptionTeaser: "Assignment in Highschool coding class, where I implemented Wordle in Python.",
        link: "", // TODO: add link
        time: [[new Date("2024-09-01"), new Date("2024-11-01")]], 
        tags: ["python", "open-source", "video-demo", "ui"] // TODO: add demo
    },
    { // TODO: add pages & repo
        name: "Python Chess Game",
        descriptionTeaser: "Assignment in Highschool coding class, the game of chess implemented in Python.",
        link: "", // TODO: add link
        time: [[new Date("2025-01-01"), new Date("2025-04-01")]], 
        tags: ["python", "open-source", "video-demo", "ui"] // TODO: add demo
    },
    { // TODO: add pages
        name: "Button Outline Demo",
        descriptionTeaser: "A small animation demo showcasing button outline effects using CSS and JavaScript, inspired by Scrimba button animation.", // TODO: add data
        link: "https://github.com/this-salami/button-outline-demo",
        time: [[new Date("2022-02-01"), new Date("2022-03-01")]], // TODO: Find out exact dates
        tags: ["js", "css", "open-source", "video-demo"] // TODO: add demo
    },
    { // TODO: add pages
        name: "Web Based Command Line",
        descriptionTeaser: "Very basic web-based command line interface for executing commands in a simulated environment, has no functionality, just design for now.", // TODO: add data
        link: "https://github.com/this-salami/cmd-line-2025",
        time: [[new Date("2023-08-01"), new Date("2023-09-01")]], // TODO: Find out exact dates
        tags: ["js", "css", "open-source", "interactive-demo"] // TODO: add demo
    },
    { // TODO: fix repo & make pages
        name: "A* Pathfinding Demo",
        descriptionTeaser: "A demonstration of the A* pathfinding algorithm, showcasing its ability to find the shortest path in a grid-based environment.", // TODO: add data
        link: "https://github.com/this-salami/A-star-pathfinding-2025-demo",
        time: [[new Date("2023-10-01")]], // TODO: Find out exact dates
        tags: ["js", "css", "open-source", "interactive-demo"] // TODO: add demo
    },
    { // TODO: make pages
        name: "3D Card Showcase",
        descriptionTeaser: "A small project displaying a card as a 3-d element with JS and CSS.", // TODO: add data
        link: "https://github.com/this-salami/3d-card-showcase",
        time: [[new Date("2021-12-01")]], // TODO: Find out exact dates
        tags: ["js", "css", "open-source", "interactive-demo"] // TODO: add demo
    },
    { // TODO: finish/find
        name: "dsa",
        descriptionTeaser: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end", "open-source", "interactive-demo"]
    },
    { // TODO: find
        name: "es",
        descriptionTeaser: "",
        link: "",
        time: [],
        tags: ["python", "ui", "open-source", "video-demo"]
    },
    { // TODO: finish/find
        name: "egep",
        descriptionTeaser: "",
        link: "",
        time: [],
        tags: ["python", "ui", "open-source"] // bro finish ts
    },
    { // TODO: finish/find
        name: "lg",
        descriptionTeaser: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end", "open-source"] // server TODO: figure out
    },
    {
        name: "Read Fast",
        descriptionTeaser: "A short project I made to test out a speed reading method called Spritz. It was pretty fun to make, and my friends and I use it on occasion.", 
        description: `
        A small project that implements a speed reading method called Spritz. It allows users to read text at a faster pace by 
        displaying one word at a time in a focused manner, improving reading speed and comprehension.`,
        link: "https://github.com/this-salami/read-fast",
        demoLink: "https://this-salami.github.io/read-fast/",
        time: [[new Date("2025-10-01")]],
        tags: ["js", "html", "css", "open-source", "interactive-demo"]
    },
    { // TODO: finish
        name: "Degree Planner (WIP)",
        descriptionTeaser: "A WIP project that I started to aid in class selection and degree matching. Uses a webscrape to check for class requirements and generates a schedule based on the classes you want to take.",
        link: "https://github.com/this-salami/class-selector",
        time: [[new Date("2026-01-01"), new Date("2026-04-01")]],
        tags: ["js", "html", "css", "php", "react", "front-end", "open-source", "interactive-demo"]
    },
    { // TODO: find
        name: "db",
        descriptionTeaser: "",
        link: "",
        time: [], // maybe idk
        tags: ["python"] // maybe back-end TODO: idk
    },
    { // TODO: finish/find
        name: "bnm",
        descriptionTeaser: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end", "open-source"]
    },
    { // TODO: finish/find
        name: "msmc",
        descriptionTeaser: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    { // TODO: finish/find
        name: "wds",
        descriptionTeaser: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    { // TODO: finish/find
        name: "ts",
        descriptionTeaser: "",
        link: "",
        time: [], // bro you aint even finishing ts
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    {
        name: "Pong",
        descriptionTeaser: "A simple Pong game implemented in JavaScript, showcasing basic game mechanics and user interaction.",
        description: `
        A small project that demonstrates a simple Pong game implemented in JavaScript. 
        It features basic game mechanics, including ball movement, paddle control, and collision detection.<br>
        Use wasd and arrow keys to play!`,
        link: "https://github.com/this-salami/pong-2023",
        demoLink: "https://this-salami.github.io/pong-2023/",
        time: [[new Date("2023-05-01")]],
        tags: ["html", "js", "css", "open-source", "interactive-demo"]
    },
    { // TODO: fix the repo
        name: "Image Scroller",
        descriptionTeaser: "A small project that allows users to scroll through a collection of images using JavaScript and CSS.",
        link: "https://github.com/this-salami/image-scroller-2023",
        time: [[new Date("2022-12-01")]],
        tags: ["html", "js", "css", "open-source", "interactive-demo"]
    },
    {
        name: "Birthday Info",
        descriptionTeaser: "A small project that displays birthday information.",
        description: `
        One of the first proper web-based applications I've built. Displays birthday information, including different zodiac signs, 
        birthstone and flower, based on the user's input. It uses JavaScript to calculate the information and CSS for styling.`,
        link: "https://github.com/this-salami/birthdayinfo-2023",
        demoLink: "https://this-salami.github.io/birthdayinfo-2023/",
        time: [[new Date("2023-01-01")]],
        tags: ["html", "js", "css", "open-source", "interactive-demo"]
    },
    { // TODO: fix the repo
        name: "CSS Loading Animations",
        descriptionTeaser: "A collection of CSS loading animations.",
        link: "https://github.com/this-salami/css-animations-2022",
        time: [[new Date("2022-07-01")]],
        tags: ["html", "js", "css", "open-source", "interactive-demo"]
    },
    {
        name: "Graphing Demo",
        descriptionTeaser: "A demo graphing calculator implemented in JavaScript.",
        description: `
        A small project that demonstrates a graphing calculator implemented in JavaScript. 
        It allows users to input mathematical functions and visualize their graphs on a coordinate plane.`,
        link: "https://github.com/this-salami/graphing-demo-2023/tree/main",
        demoLink: "https://this-salami.github.io/graphing-demo-2023/",
        time: [[new Date("2023-02-01"), new Date("2023-03-01")]],
        tags: ["html", "js", "css", "open-source", "interactive-demo"]
    },
    {
        name: "IBM DS Certification Data Visualization Project",
        descriptionTeaser: "A data visualization project for the IBM Data Science Professional Certificate, showcasing data analysis and visualization skills.",
        link: "https://github.com/this-salami/data-visualization-project-IBMDS",
        time: [[new Date("2026-06-01")]],
        tags: ["python", "data-science", "open-source", "jupyter-notebook", "certification"]
    }
];