const projects = [
    {
        name: "fg",
        description: "WIP - Getting data", // TODO: get data
        link: "",
        time: [[new Date("2020-12-01"), new Date("2021-07-01")]],
        tags: ["lua", "game-design", "ui", "video-demo"]
    },
    { // TODO: find more of my python macros
        name: "Python Autoclicker",
        description: "",
        link: "",
        time: [[new Date("2022-06-01")]],
        tags: ["python", "open-source", "video-demo"] // TODO: add demo
    },
    {
        name: "Python Piano Tiles Bot",
        description: "",
        link: "",
        time: [[new Date("2023-02-01")]],
        tags: ["python", "open-source", "video-demo"] // TODO: add demo
    },
    {
        name: "Minesweeper Bookmarklet",
        description: "", // TODO: add data
        link: "https://github.com/this-salami/minesweeper-bookmarklet",
        time: [[new Date("2023-02-01"), new Date("2023-04-01")]], // TODO: Find out exact dates
        tags: ["js", "open-source", "video-demo"] // TODO: add demo
    },
    {
        name: "Isometric Map Test",
        description: "", // TODO: add data
        link: "https://github.com/this-salami/Isometric-Map-Test-2025",
        time: [[new Date("2023-09-01"), new Date("2023-11-01")]], // TODO: Find out exact dates
        tags: ["js", "open-source", "video-demo"] // TODO: add demo
    },
    {
        name: "hsc",
        description: "",
        link: "",
        time: [[new Date("2024-07-01"), new Date("2025-05-01")]], // TODO: Placeholder for multiple
        tags: ["python", "game-design", "ui", "front-end", "open-source", "video-demo", "interactive-demo"]
    },
    {
        name: "Button Outline Demo",
        description: "", // TODO: add data
        link: "https://github.com/this-salami/button-outline-demo",
        time: [[new Date("2022-02-01"), new Date("2022-03-01")]], // TODO: Find out exact dates
        tags: ["js", "open-source", "video-demo"] // TODO: add demo
    },
    {
        name: "Web Based Command Line",
        description: "", // TODO: add data
        link: "https://github.com/this-salami/cmd-line-2025",
        time: [[new Date("2024-02-01"), new Date("2024-04-01")]], // TODO: Find out exact dates
        tags: ["js", "open-source", "interactive-demo"] // TODO: add demo
    },
    {
        name: "A* Pathfinding Demo",
        description: "", // TODO: add data
        link: "https://github.com/this-salami/A-star-pathfinding-2025-demo",
        time: [[new Date("2024-04-01"), new Date("2024-06-01")]], // TODO: Find out exact dates
        tags: ["js", "open-source", "interactive-demo"] // TODO: add demo
    },
    {
        name: "3D Card Showcase",
        description: "", // TODO: add data
        link: "https://github.com/this-salami/3d-card-showcase",
        time: [[new Date("2021-12-01")]], // TODO: Find out exact dates
        tags: ["js", "open-source", "interactive-demo"] // TODO: add demo
    },
    { // TODO: finish/find
        name: "dsa",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end", "open-source", "interactive-demo"]
    },
    { // TODO: find
        name: "es",
        description: "",
        link: "",
        time: [],
        tags: ["python", "ui", "open-source", "video-demo"]
    },
    { // TODO: finish/find
        name: "egep",
        description: "",
        link: "",
        time: [],
        tags: ["python", "ui", "open-source"] // bro finish ts
    },
    { // TODO: finish/find
        name: "lg",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end", "open-source"] // server TODO: figure out
    },
    {
        name: "rf",
        description: "",
        link: "",
        time: [[new Date("2025-10-01")]],
        tags: ["js", "html", "css", "open-source", "interactive-demo"] // TODO: add demo
    },
    { // TODO: finish
        name: "cs",
        description: "",
        link: "",
        time: [[new Date("2026-01-01"), new Date("2026-04-01")]],
        tags: ["js", "html", "css", "php", "react", "front-end", "open-source", "interactive-demo"]
    },
    { // TODO: find
        name: "db",
        description: "",
        link: "",
        time: [], // maybe idk
        tags: ["python"] // maybe back-end TODO: idk
    },
    { // TODO: finish/find
        name: "bnm",
        description: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end", "open-source"]
    },
    { // TODO: finish/find
        name: "msmc",
        description: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    { // TODO: finish/find
        name: "wds",
        description: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    { // TODO: finish/find
        name: "ts",
        description: "",
        link: "",
        time: [], // bro you aint even finishing ts
        tags: ["js", "html", "css", "ui", "front-end"]
    }
]

const tags = new Set();
const timelineContainer = document.getElementById("timeline-container");
const timelineElement = document.getElementById("timeline");
const projectContainer = document.getElementById("project-container");
const filterContainer = document.getElementById("filter-container");
const filterCheckboxContainer = document.getElementById("filters");

const MONTH_HEIGHT = timelineContainer.getAttribute("data-month-height");

function getFilteredProjects() {
    let res = [];

    const filters = Array.from(filterCheckboxContainer.children);
    const ignoredFilters = filters.filter(filter => filter.classList.contains("ignore")).map(filter => filter.innerText);
    const exclusiveFilters = filters.filter(filter => filter.classList.contains("exclusive")).map(filter => filter.innerText);

    projects.forEach(project => {
        const hasIgnoredTag = ignoredFilters.some(filter => project.tags.includes(filter));
        const projectExclusiveTags = exclusiveFilters.filter(filter => project.tags.includes(filter));
        
        if (project.time.length === 0) {
            return;
        }

        if (hasIgnoredTag) {
            return;
        } else if (exclusiveFilters.length > 0 && projectExclusiveTags.length !== exclusiveFilters.length) {
            return;
        } else {
            res.push(project);
        }
    });
    /*
    const projectElements = projectContainer.querySelectorAll(".project");
    projectElements.forEach(projectElement => {
        const projectTags = Array.from(projectElement.querySelectorAll(".tags span")).map(tag => tag.innerText);
        
        const hasIgnoredTag = ignoredFilters.some(filter => projectTags.includes(filter));
        const projectExclusiveTags = exclusiveFilters.filter(filter => projectTags.includes(filter));

        if (hasIgnoredTag) {
            projectElement.style.display = "none";
        } else if (exclusiveFilters.length > 0 && projectExclusiveTags.length !== exclusiveFilters.length) {
            projectElement.style.display = "none";
        } else {
            projectElement.style.display = "block"; 
            res.push(projects[projectElement.getAttribute("data-index")]);
        }
    });
    */
    return res;
}

projects.forEach(project => {
    project.tags.forEach(tag => {
        tags.add(tag);
    });
});

tags.forEach(tag => {
    const filterItem = document.createElement("span");
    filterItem.classList.add(tag);

    filterItem.innerText = tag;

    filterCheckboxContainer.appendChild(filterItem);

    filterItem.addEventListener("click", () => {
        if (filterItem.classList.contains("ignore")) {
            filterItem.classList.remove("ignore");
            filterItem.classList.add("exclusive");
        } else if (filterItem.classList.contains("exclusive")) {
            filterItem.classList.remove("exclusive");
        } else {
            filterItem.classList.add("ignore");
        }

        createTimeline();
    });
});

let absoluteStart = new Date();

// simply gets the absolute endpoints of a project
for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    let earlierstTime = new Date();
    let latestTime = null;

    project.time.forEach(timeRange => {
        const start = timeRange[0];
        const end = timeRange[1] || start;

        if (start.valueOf() < earlierstTime.valueOf()) {
            earlierstTime = start;
            
            if (start.valueOf() < absoluteStart.valueOf()) {
                absoluteStart = start;
            }
        }
        if (latestTime === null || end.valueOf() > latestTime.valueOf()) {
            latestTime = end;
        }
    });

    project.earlierstTime = earlierstTime;
    project.latestTime = latestTime;
    project.dataIndex = i;
}

function clearTimeline() {
    timelineElement.innerHTML = "";
    projectContainer.innerHTML = "";
}

// creates entire timeline
function createTimeline() {
    clearTimeline();

    const projectsByLength = getFilteredProjects().sort((a, b) => (b.latestTime - b.earlierstTime) - (a.latestTime - a.earlierstTime));

    const timelines = [];

    let earlierstTime = new Date();
    let latestTime = absoluteStart;

    for (let i = 0; i < projectsByLength.length; i++) {
        const project = projectsByLength[i];
        
        if (project.earlierstTime.valueOf() < earlierstTime.valueOf()) {
            earlierstTime = project.earlierstTime;
        }
        if (project.latestTime && project.latestTime.valueOf() > latestTime.valueOf()) {
            latestTime = project.latestTime;
            console.log(project.name, project.latestTime);
        }
    }

    while (projectsByLength.length > 0) {
        const timeline = [];
        const occupiedTimes = [];

        for (let i = 0; i < projectsByLength.length; i++) {
            const project = projectsByLength[i];

            let overlaps = false;
            for (let j = 0; j < occupiedTimes.length; j++) {
                const occupiedStart = occupiedTimes[j][0];
                const occupiedEnd = occupiedTimes[j][1];

                for (let k = 0; k < project.time.length; k++) {
                    const projectStart = project.time[k][0];
                    const projectEnd = project.time[k][1] || projectStart;

                    if (projectStart.valueOf() < occupiedEnd.valueOf() && projectEnd.valueOf() > occupiedStart.valueOf()) {
                        overlaps = true;
                        break;
                    }
                }
                if (overlaps) { break; }
            }
            if (overlaps) { continue; }

            timeline.push(project);
            for (let k = 0; k < project.time.length; k++) {
                const projectStart = project.time[k][0];
                const projectEnd = project.time[k][1] || projectStart;
                occupiedTimes.push([projectStart, projectEnd]);
            }
            projectsByLength.splice(i, 1);
            i--; // Adjust the index after removing an element
        }

        timelines.push(timeline);
    }

    console.log(timelines.length);
    
    /*
    if (earlierstTime.valueOf() > latestTime.valueOf()) {
        earlierstTime = absoluteStart;
    }

    if (latestTime.valueOf() < earlierstTime.valueOf()) {
        latestTime = new Date();
    }
    */

    console.log(earlierstTime, latestTime);

    createTimelineBar(earlierstTime, latestTime);
    createProjectTimelines(timelines, earlierstTime, latestTime);
}

// creates project elements and timeline elements
function createProjectTimelines(timelines, start, end = new Date()) {
    const MonthCount = (end.getMonth() + end.getFullYear() * 12) - (start.getMonth() + start.getFullYear() * 12);
    for (let i = 0; i < timelines.length; i++) {
        const timelineElement = document.createElement("div");
        timelineElement.classList.add("project-timeline");
        timelineElement.setAttribute("data-index", i);
        timelineElement.style.gridTemplateRows = `repeat(${MonthCount}, ${MONTH_HEIGHT}px)`;

        let prevProjectEnd = end;

        timelines[i].forEach(project => {
            project.time.forEach(timeRange => {
                const projectStart = timeRange[0];
                const projectEnd = timeRange[1] || projectStart;
                const projectElement = document.createElement("div");
                projectElement.classList.add("project");
                //projectElement.style.top = `${((end.getMonth() + end.getFullYear() * 12) - (projectStart.getMonth() + projectStart.getFullYear() * 12)) * MONTH_HEIGHT}px`;
                //projectElement.style.height = `${((projectEnd.getMonth() + projectEnd.getFullYear() * 12) - (projectStart.getMonth() + projectStart.getFullYear() * 12)) * MONTH_HEIGHT}px`;
                projectElement.innerHTML = `
                    <h3>${project.name}</h3>
                    <div class="tags">
                        ${project.tags.map(tag => `<span class="${tag} unselectable">${tag}</span>`).join('')}
                    </div>
                    <p>${project.description}</p>
                    <a href="${project.link}">Learn more</a>
                `;
                projectElement.style.gridRowStart = ((end.getMonth() + end.getFullYear() * 12) - (projectEnd.getMonth() + projectEnd.getFullYear() * 12)) + 1;
                projectElement.style.gridRowEnd = ((end.getMonth() + end.getFullYear() * 12) - (projectStart.getMonth() + projectStart.getFullYear() * 12)) + 1;
                timelineElement.appendChild(projectElement);
            });
        });

        projectContainer.appendChild(timelineElement);
    }
}

// note: hover, lower visibility of other elements, maybe zoom entire project into view (TODO)

// creates timeline bar on the left, with month and year markings
function createTimelineBar(start, end=new Date()) {
    end = new Date(end.getTime());
    const isCurrent = end.getFullYear() === new Date().getFullYear() && end.getMonth() === new Date().getMonth();
    end.setDate(2);
    end.setMonth(end.getMonth() + 1);

    const finalMonth = end.getMonth();
    const finalYear = end.getFullYear();
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const height = ((finalMonth - 1 + finalYear * 12) - (startMonth + startYear * 12)) * MONTH_HEIGHT;

    timelineContainer.style.height = `${height}px`;

    let currentMonth = finalMonth;
    let currentYear = finalYear;
    let isFirst = true;

    let yearBar = document.createElement("div");
    yearBar.style.top = `0px`;
    yearBar.style.height = `${currentMonth * MONTH_HEIGHT}px`;
    timelineElement.appendChild(yearBar);

    while (true) {
        const monthElement = document.createElement("span");
        monthElement.style.top = `${((currentYear == finalYear ? finalMonth : 12) - currentMonth) * MONTH_HEIGHT}px`;
        if (isFirst) {
            if (isCurrent) {
                monthElement.classList.add("current");
                monthElement.innerText = "Now";
                monthElement.style.top = "-20px";
            }
            isFirst = false;
            
            const yearElement = document.createElement("span");
            yearElement.classList.add("year");
            yearElement.innerText = `${currentYear}`;
            yearElement.style.top = "0px";
            yearBar.appendChild(yearElement);
        } else if (currentMonth === 11) {
            const yearElement = document.createElement("span");
            yearElement.classList.add("year");
            yearElement.innerText = `${currentYear}`;
            yearElement.style.top = "0px";

            yearBar = document.createElement("div");
            yearBar.style.top = `${((finalMonth + finalYear * 12) - ((currentYear + 1) * 12)) * MONTH_HEIGHT}px`;
            yearBar.style.height = `${MONTH_HEIGHT * 12}px`;
            if (currentYear === startYear){
                console.log(startMonth);
                yearBar.style.height = `${(12 - startMonth) * MONTH_HEIGHT}px`;
            }
            timelineElement.appendChild(yearBar);

            yearBar.appendChild(yearElement);

            monthElement.classList.add("month");
            monthElement.innerText = `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'short' })}`;
            // TODO: maybe change digits idividually for cool effect, also check logic
        } else {
            monthElement.classList.add("month");
            monthElement.innerText = `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'short' })}`;
        }
        yearBar.appendChild(monthElement);
        //monthElement.style.top = `${((finalMonth + finalYear * 12) - (currentMonth + currentYear * 12)) * MONTH_HEIGHT}px`;

        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }

        if (currentYear * 12 + currentMonth < startYear * 12 + startMonth) {
            break;
        }
    }
}

createTimeline();