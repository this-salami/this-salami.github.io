import { projects } from "./projects.js";

const root = document.documentElement;

const tags = new Set();
const timelineContainer = document.getElementById("timeline-container");
const timelineElement = document.getElementById("timeline");
const projectContainer = document.getElementById("project-container");
const filterContainer = document.getElementById("filter-container");
const filterCheckboxContainer = document.getElementById("filters");

const MONTH_HEIGHT = timelineContainer.getAttribute("data-month-height");
const COLLAPSED_MONTH_HEIGHT = timelineContainer.getAttribute("data-collapsed-month-height");

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

    let whitespaceTimeline = new Array(
        latestTime.getFullYear() * 12 +  latestTime.getMonth() - (earlierstTime.getFullYear() * 12 + earlierstTime.getMonth()) + 1
    ).fill(3); // 3 = 11 (last bit = whitespace, rest = count)

    for (let i = 0; i < timelines[0].length; i++) {
        const project = timelines[0][i];
        if (project.time.length === 0) { continue; }
        project.time.forEach(timeRange => {
            const start = timeRange[0];
            const end = timeRange[1] || start;
            
            //const startIndex = (start.getFullYear() * 12 + start.getMonth()) - (earlierstTime.getFullYear() * 12 + earlierstTime.getMonth());
            //const endIndex = (end.getFullYear() * 12 + end.getMonth()) - (earlierstTime.getFullYear() * 12 + earlierstTime.getMonth());
            const startIndex = (latestTime.getFullYear() * 12 + latestTime.getMonth()) - (start.getFullYear() * 12 + start.getMonth());
            const endIndex = (latestTime.getFullYear() * 12 + latestTime.getMonth()) - (end.getFullYear() * 12 + end.getMonth());

            // TODO: bandaid solution for incosistency
            for (let j = endIndex; j <= startIndex; j++) {
                whitespaceTimeline[j] = 2; // 2 = 10 (last bit = not whitespace, rest = count)
            }
        });
    }

    whitespaceTimeline = whitespaceTimeline.reduce((acc, curr, i) => {
        if (acc.length === 0) {
            acc.push(curr);
            return acc;
        }
        if ((curr & 1) === (acc[acc.length - 1] & 1)) {
            acc[acc.length - 1] += curr >> 1 << 1; // add count, ignore isWhitespace bit
        } else {
            acc.push(curr);
        }
        return acc;
    }, []);

    for (let i = 0; i < whitespaceTimeline.length; i++) {
        console.log(whitespaceTimeline[i] & 1, whitespaceTimeline[i] >> 1);
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
    createProjectTimelines(timelines, earlierstTime, latestTime, whitespaceTimeline);
}

// creates project elements and timeline elements
function createProjectTimelines(timelines, start, end = new Date(), whitespaceTimeline) {
    const MonthCount = (end.getMonth() + end.getFullYear() * 12) - (start.getMonth() + start.getFullYear() * 12);
    for (let i = 0; i < timelines.length; i++) {
        const projectTimelineElement = document.createElement("div");
        projectTimelineElement.classList.add("project-timeline");
        projectTimelineElement.setAttribute("data-index", i);
        //projectTimelineElement.style.gridTemplateRows = `repeat(${MonthCount}, ${MONTH_HEIGHT}px)`;
        projectTimelineElement.style.gridTemplateRows = whitespaceTimeline.map(value => {
            if ((value & 1) === 1) { // is whitespace
                return `repeat(${value >> 1}, ${COLLAPSED_MONTH_HEIGHT}px)`;
            }
            return `repeat(${value >> 1}, ${MONTH_HEIGHT}px)`;
        }).join(' ');

        //timelineElement.style.gridTemplateRows = `repeat(${MonthCount}, ${MONTH_HEIGHT}px)`;
        timelineElement.style.gridTemplateRows = whitespaceTimeline.map(value => {
            if ((value & 1) === 1) { // is whitespace
                return `repeat(${value >> 1}, ${COLLAPSED_MONTH_HEIGHT}px)`;
            }
            return `repeat(${value >> 1}, ${MONTH_HEIGHT}px)`;
        }).join(' ');

        let prevProjectEnd = end;

        timelines[i].forEach(project => {
            project.time.forEach(timeRange => {
                const projectStart = timeRange[0];
                const projectEnd = timeRange[1] || projectStart;
                const projectElement = document.createElement("div");
                projectElement.classList.add("project");
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
                projectTimelineElement.appendChild(projectElement);

                projectElement.addEventListener("mouseover", () => {
                    root.style.setProperty('--project-opacity', '0.5');
                });
                projectElement.addEventListener("mouseout", () => {
                    root.style.setProperty('--project-opacity', '1');
                });

                const inViewHandler = () => {
                    const rect = projectElement.getBoundingClientRect();
                    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
                    if (isInView) {
                        projectElement.classList.add("in-view");
                    }
                }

                window.addEventListener("scroll", inViewHandler);
                setTimeout(inViewHandler, 100); // Check if in view on load
            });
        });

        projectContainer.appendChild(projectTimelineElement);
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

    //timelineContainer.style.height = `${height}px`;

    let currentMonth = finalMonth;
    let currentYear = finalYear;
    let isFirst = true;

    // helper functions
    const toMonthShortForm = (currentYear, currentMonth) => new Date(currentYear, currentMonth).toLocaleString('default', { month: 'short' });
    const gridRowStart = (currentYear, currentMonth) => (finalMonth + finalYear * 12) - (currentYear * 12 + currentMonth) + 1;
    const clampedGridRowSpan = (currentYear, currentMonth) => (currentYear * 12 + currentMonth) - (startYear * 12 + startMonth) + 1;

    while (true) {
        const monthBar = document.createElement("div");
        monthBar.classList.add("month-bar");
        monthBar.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span 1`;
        timelineElement.appendChild(monthBar);

        const monthCell = document.createElement("div");
        monthCell.classList.add("month-cell");
        monthCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span 1`;
        timelineElement.appendChild(monthCell);

        const monthElement = document.createElement("span");
        monthElement.classList.add("month");
        monthElement.innerText = `${toMonthShortForm(currentYear, currentMonth)}`;
        monthCell.appendChild(monthElement);
        
        const staticElement = document.createElement("span");
        staticElement.classList.add("static");
        staticElement.innerText = `${toMonthShortForm(currentYear, currentMonth)} ${currentYear}`;
        monthCell.appendChild(staticElement);

        if (isFirst || currentMonth === 11) {
            const yearCell = document.createElement("div");
            yearCell.classList.add("year-cell");
            yearCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span ${currentMonth === 11 ? 12 : (currentMonth + 1)}`;
            if (currentYear === startYear){
                yearCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span ${clampedGridRowSpan(currentYear, currentMonth)}`;
            }
            timelineElement.appendChild(yearCell);
        
            const yearElement = document.createElement("span");
            yearElement.classList.add("year");
            yearElement.innerText = `${currentYear % 10}`;
            yearCell.appendChild(yearElement);
        }

        if (isFirst || (currentYear + 1) % 10 === 0) {
            const decadeCell = document.createElement("div");
            decadeCell.classList.add("decade-cell");
            decadeCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span ${(currentYear + 1) % 10 === 0 ? 120 : (currentYear % 10) * 12 + currentMonth}`;
            if (currentYear - 10 <= startYear){
                decadeCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span ${clampedGridRowSpan(currentYear, currentMonth)}`;
            }
            timelineElement.appendChild(decadeCell);

            const decadeElement = document.createElement("span");
            decadeElement.classList.add("decade");
            decadeElement.innerText = `${Math.floor(currentYear / 10)}`;
            decadeCell.appendChild(decadeElement);
        }

        if (isFirst && isCurrent) {
            monthElement.classList.add("current");
            monthElement.innerText = "Now";
            monthElement.style.top = "-20px";
        }
        isFirst = false;

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