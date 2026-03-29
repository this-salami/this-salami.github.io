const projects = [
    {
        name: "fg",
        description: "desc",
        link: "",
        time: [[new Date("2021-01-01"), new Date("2021-07-01")]],
        tags: ["lua", "game-design", "ui"]
    },
    {
        name: "df?",
        description: "",
        link: "",
        time: [],
        tags: ["lua"]
    },
    {
        name: "pm",
        description: "",
        link: "",
        time: [[new Date("2021-02-01"), new Date("2025-08-01")]], // FIX
        tags: ["python"]
    },
    {
        name: "jsb",
        description: "",
        link: "",
        time: [[new Date("2021-03-01"), new Date("2021-09-01")]], // Find out 
        tags: ["js"]
    },
    {
        name: "hsc",
        description: "",
        link: "",
        time: [[new Date("2024-07-01"), new Date("2025-05-01")]], // Placeholder for multiple
        tags: ["python", "game-design", "ui", "front-end"]
    },
    {
        name: "scrim",
        description: "",
        link: "",
        time: [], // Placeholder for like 10 lowk
        tags: ["js", "html", "css", "game-design", "ui", "front-end"]
    },
    {
        name: "dsa",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    {
        name: "es",
        description: "",
        link: "",
        time: [],
        tags: ["python", "ui"]
    },
    {
        name: "egep",
        description: "",
        link: "",
        time: [],
        tags: ["python", "ui"]
    },
    {
        name: "lg",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end"] // server TODO: figure out
    },
    {
        name: "rf",
        description: "",
        link: "",
        time: [[new Date("2025-10-01")]],
        tags: ["js", "html", "css"]
    },
    {
        name: "cs",
        description: "",
        link: "",
        time: [[new Date("2026-01-01"), new Date("2026-04-01")]],
        tags: ["js", "html", "css", "php", "react", "front-end"]
    },
    {
        name: "db",
        description: "",
        link: "",
        time: [], // maybe idk
        tags: ["python"] // maybe back-end TODO: idk
    },
    {
        name: "bnm",
        description: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    {
        name: "msmc",
        description: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    {
        name: "wds",
        description: "",
        link: "",
        time: [], // bro finish ts
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    {
        name: "ts",
        description: "",
        link: "",
        time: [], // bro you aint even finishing ts
        tags: ["js", "html", "css", "ui", "front-end"]
    }
]

const tags = new Set();
const timelineContainer = document.getElementById("timeline-container");
const projectContainer = document.getElementById("project-container");
const filterContainer = document.getElementById("filter-container");
const filterCheckboxContainer = document.getElementById("checkboxes");

const MONTH_HEIGHT = timelineContainer.getAttribute("data-month-height");

projects.forEach((project, index) => {
    const projectElement = document.createElement("div");
    projectElement.classList.add("project");
    projectElement.setAttribute("data-index", index);
    projectElement.innerHTML = `
        <h3>${project.name}</h3>
        <div class="tags">
            ${project.tags.map(tag => `<span class="${tag} unselectable">${tag}</span>`).join('')}
        </div>
        <p>${project.description}</p>
        <a href="${project.link}">Learn more</a>
    `;
    project.tags.forEach(tag => tags.add(tag));

    //projectContainer.appendChild(projectElement);
})

function updateProjectVisibility() {
    const filters = Array.from(filterCheckboxContainer.children);
    const ignoredFilters = filters.filter(filter => filter.classList.contains("ignore")).map(filter => filter.innerText);
    const exclusiveFilters = filters.filter(filter => filter.classList.contains("exclusive")).map(filter => filter.innerText);

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
        }
    });
}

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

        updateProjectVisibility();
    });
});

let absoluteStart = new Date();

// simply gets the absolute endpoints of a project
for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    let earlierstTime = new Date();
    let latestTime = new Date();

    project.time.forEach(timeRange => {
        const start = timeRange[0];
        const end = timeRange[1] || new Date();

        if (start < earlierstTime) {
            earlierstTime = start;
            
            if (start < absoluteStart) {
                absoluteStart = start;
            }
        } else if (end > latestTime) {
            latestTime = end;
        }
    });

    project.earlierstTime = earlierstTime;
    project.latestTime = latestTime;
    projects.dataIndex = i;
}

const projectsByLength = [...projects].sort((a, b) => (b.latestTime - b.earlierstTime) - (a.latestTime - a.earlierstTime));

const timelines = [];

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

                if (projectStart < occupiedEnd && projectEnd > occupiedStart) {
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

function createTimeline(start, end = new Date()) {
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

function createTimelineBar(start, end=new Date()) {
    const timeline = document.getElementById("timeline");
    
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
    timeline.appendChild(yearBar);

    while (currentMonth !== startMonth || currentYear !== startYear) {
        const monthElement = document.createElement("span");
        monthElement.style.top = `${((currentYear == finalYear ? finalMonth : 12) - currentMonth) * MONTH_HEIGHT}px`;
        if (isFirst) {
            monthElement.classList.add("current");
            monthElement.innerText = "Now";
            isFirst = false;
        } else if (currentMonth === 0) {
            monthElement.classList.add("year");
            monthElement.innerText = `${currentYear}`;
            monthElement.style.top = "0px";

            yearBar = document.createElement("div");
            yearBar.style.top = `${((finalMonth + finalYear * 12) - (currentYear * 12)) * MONTH_HEIGHT}px`;
            yearBar.style.height = `${MONTH_HEIGHT * 12}px`;
            if (currentYear - 1 === startYear){
                console.log(startMonth);
                yearBar.style.height = `${(12 - startMonth) * MONTH_HEIGHT}px`;
            }
            timeline.appendChild(yearBar);

            // TODO: maybe change digits idividually for cool effect, also check logic
        } else {
            monthElement.classList.add("month");
            monthElement.innerText = `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'short' })}`;
        }
        //monthElement.style.top = `${((finalMonth + finalYear * 12) - (currentMonth + currentYear * 12)) * MONTH_HEIGHT}px`;
        yearBar.appendChild(monthElement);

        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
    }
}

createTimelineBar(absoluteStart);
createTimeline(absoluteStart);