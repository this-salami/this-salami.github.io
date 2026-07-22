const root = document.documentElement;

const tagCounts = {};

const pinnedProjectsContainer = document.getElementById("pinned-projects");

const timelineContainer = document.getElementById("timelineContainer");
const timelineElement = document.getElementById("timeline");
//const projectContainer = document.getElementById("project-container");
const filterContainer = document.getElementById("filter-container");
const filterCheckboxContainer = document.getElementById("filters");

const bufferElement = document.getElementById("buffer");

const MONTH_HEIGHT = timelineElement.getAttribute("data-month-height");
const COLLAPSED_MONTH_HEIGHT = timelineElement.getAttribute("data-collapsed-month-height");

const PINNED_PREFIX = "p-"; // p- (Pinned)

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
    return res;
}

function getPinnedProjects() {
    let res = [];

    projects.forEach(project => {
        if (!project.tags.includes("pinned")) { return; }
        res.push(project);
    });

    // sort so that latest is first
    res.sort((projectA, projectB) => {
        let earliestA = projectA.earliestTime;
        let earliestB = projectB.earliestTime;
        return earliestB - earliestA;
    });

    return res;
}

projects.forEach(project => {
    project.tags.forEach(tag => {
        if (tagCounts[tag] === undefined) {
            tagCounts[tag] = 0;
        }
        tagCounts[tag]++;
    });
});

const tags = new Set(Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])); // sort by count
tags.forEach(tag => {
    const filterItem = document.createElement("span");
    filterItem.classList.add(tag);
    filterItem.classList.add("tag");

    filterItem.innerText = tag;

    // TODO: make a better way to show what the filter does (maybe a tooltip or something)
    filterItem.title = "Optional filter: tag isn't required, nor hidden";
    filterCheckboxContainer.appendChild(filterItem);

    filterItem.addEventListener("click", () => {
        if (filterItem.classList.contains("ignore")) {
            filterItem.classList.remove("ignore");
            filterItem.classList.add("exclusive");
            filterItem.title = "Exclusive filter: Only show projects with this tag";
        } else if (filterItem.classList.contains("exclusive")) {
            filterItem.classList.remove("exclusive");
            filterItem.title = "Optional filter: tag isn't required, nor hidden";
        } else {
            filterItem.classList.add("ignore");
            filterItem.title = "Ignored filter: Hide projects with this tag";
        }

        createTimeline();
    });
});

let absoluteStart = new Date();

// simply gets the absolute endpoints of a project
for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    let earliestTime = new Date();
    let latestTime = null;

    project.time.forEach(timeRange => {
        const start = timeRange[0];
        const end = timeRange[1] || start;

        if (start.valueOf() < earliestTime.valueOf()) {
            earliestTime = start;
            
            if (start.valueOf() < absoluteStart.valueOf()) {
                absoluteStart = start;
            }
        }
        if (latestTime === null || end.valueOf() > latestTime.valueOf()) {
            latestTime = end;
        }
    });

    project.earliestTime = earliestTime;
    project.latestTime = latestTime;
    project.dataIndex = i;
}

const projectRemovingCallbacks = {};
const projectClickCallbacks = {};
let focusedProjectIdentifier = null; // TODO: idk if this is needed
function clearTimeline() {
    timelineElement.innerHTML = "";
    //projectContainer.innerHTML = "";

    for (const key in scrollCallbacks) {
        if (!scrollCallbacks.hasOwnProperty(key)) continue;
        if (key.startsWith(PINNED_PREFIX)) continue; // pinned projects are not removed when clearing timeline
        delete scrollCallbacks[key];
    }
    for (const key in projectRemovingCallbacks) {
        if (!projectRemovingCallbacks.hasOwnProperty(key)) continue;
        if (key.startsWith(PINNED_PREFIX)) continue; // pinned projects are not removed when clearing timeline
        // TODO: I think this is working, crazy improvements (it was so cooked :sob:)
        projectRemovingCallbacks[key]();
        delete projectRemovingCallbacks[key];
        delete projectClickCallbacks[key];
    }

    focusedProjectIdentifier = null;

    if (projects1frCallback) {
        window.removeEventListener("resize", projects1frCallback);
    }
}

// creates entire timeline
function createTimeline() {
    clearTimeline();

    const projectsByLength = getFilteredProjects().sort((a, b) => (b.latestTime - b.earliestTime) - (a.latestTime - a.earliestTime));

    const timelines = [];

    let earliestTime = new Date();
    let latestTime = absoluteStart;

    for (let i = 0; i < projectsByLength.length; i++) {
        const project = projectsByLength[i];
        
        if (project.earliestTime.valueOf() < earliestTime.valueOf()) {
            earliestTime = project.earliestTime;
        }
        if (project.latestTime && project.latestTime.valueOf() > latestTime.valueOf()) {
            latestTime = project.latestTime;
            //console.log(project.name, project.latestTime);
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

                    if (projectStart.valueOf() <= occupiedEnd.valueOf() && projectEnd.valueOf() >= occupiedStart.valueOf()) {
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
        latestTime.getFullYear() * 12 +  latestTime.getMonth() - (earliestTime.getFullYear() * 12 + earliestTime.getMonth()) + 1
    ).fill(3); // 3 = 11 (last bit = whitespace, rest = count)

    for (let i = 0; i < timelines[0].length; i++) {
        const project = timelines[0][i];
        if (project.time.length === 0) { continue; }
        project.time.forEach(timeRange => {
            const start = timeRange[0];
            const end = timeRange[1] || start;
            
            //const startIndex = (start.getFullYear() * 12 + start.getMonth()) - (earliestTime.getFullYear() * 12 + earliestTime.getMonth());
            //const endIndex = (end.getFullYear() * 12 + end.getMonth()) - (earliestTime.getFullYear() * 12 + earliestTime.getMonth());
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
    if (earliestTime.valueOf() > latestTime.valueOf()) {
        earliestTime = absoluteStart;
    }

    if (latestTime.valueOf() < earliestTime.valueOf()) {
        latestTime = new Date();
    }
    */

    console.log(earliestTime, latestTime);

    createTimelineBar(earliestTime, latestTime);
    createProjectTimelines(timelines, earliestTime, latestTime, whitespaceTimeline);
}

const scrollAnimTime = 500; // in ms
const scrollCallbacks = {};
/**
 * @param {number|HTMLElement} pos - The position to lock the scroll to, or an element to lock the scroll to.
 * @param {Object} options - scroll options
 * @param {number?} options.offset - scroll offset
 * @param {number?} options.time - scroll animation time (in ms)
 * @param {boolean?} options.instant - if true, scrolls instantly, and locks for animation time
*/
function lockScroll(pos = window.scrollY, options = {offset: 0, time: scrollAnimTime, instant: false}) {
    let elem = null;
    let animTime = options.time || scrollAnimTime;

    const updatePos = () => {
        if (elem === null) { return; }
        const rect = elem.getBoundingClientRect();
        let scrollY = window.scrollY;
        if (document.body.style.position === 'fixed') { scrollY = -parseFloat(document.body.style.top || '0'); }
        pos = rect.top + scrollY + options.offset;
    }
    if (pos instanceof HTMLElement) {
        elem = pos;
        updatePos();
    }
    let currScroll = document.body.style.position === 'fixed' ? -parseFloat(document.body.style.top || '0') : window.scrollY;
    /*
    window.scrollTo({
        top: pos,
        behavior: 'smooth'
    });
    */ 
    if (document.body.style.position !== 'fixed') {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${currScroll}px`;
        document.body.style.width = '100%';
    }

    let startTime = null;
    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        if (document.body.style.position !== 'fixed') { return; } // if scroll unlocked during animation, stop animating
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animTime, 1);
        
        const easedProgress = options.instant ? 1 : 1 - Math.pow(1 - progress, 3); // ease-out cubic
        updatePos();
        let newScroll = currScroll + (pos - currScroll) * easedProgress;
        
        document.body.style.top = `-${newScroll}px`;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            updatePos();
            newScroll = pos;
            document.body.style.top = `-${pos}px`;
        }

        for (const key in scrollCallbacks) {
            if (!scrollCallbacks.hasOwnProperty(key)) continue;
            scrollCallbacks[key](newScroll);
        }
    }

    window.requestAnimationFrame(step);
}
function unlockScroll() {
    const currScroll = -parseFloat(document.body.style.top || '0');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, currScroll);
}

window.addEventListener("mousedown", () => {
    if (document.body.classList.contains("project-focused")) {
        root.classList.add("background-active");
    }
});
window.addEventListener("mouseup", () => {
    root.classList.remove("background-active");
});

let currFullscreenElement = null;
document.addEventListener("fullscreenchange", (event) => {
    if (document.fullscreenElement) {
        currFullscreenElement = document.fullscreenElement;
        return;
    }
    if (currFullscreenElement) {
        currFullscreenElement.classList.remove("fullscreen");
        currFullscreenElement = null;
    }
});


let mouseX = 0;
let mouseY = 0;
window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});


function getEmInPixels(element) {
    const fontSize = window.getComputedStyle(element || document.documentElement).fontSize;
    return parseFloat(fontSize);
}

// TODO: feel like could be implemented better
function updateProject1fr(timelineCount) {
    const totalWidth = timelineElement.getBoundingClientRect().width;
    const timelineBarWidth = "6em";

    const timelineWidth = `calc(${totalWidth}px - ${timelineBarWidth})`;
    root.style.setProperty('--timeline-width', timelineWidth);

    const project1fr = `calc(var(--timeline-width) / ${timelineCount})`;
    root.style.setProperty('--projects-1fr', project1fr);

    const timelineColPadding = 20 * (timelineCount) - 10; // 20px padding per column
    const barWidth = getEmInPixels(timelineElement) * 8; // 8em in pixels
    let mobileAdjust = 0;
    if (window.innerWidth < 450) {
        mobileAdjust = -20;
    }
    const timelineScrollWidth = timelineCount * 320 + timelineColPadding - timelineElement.getBoundingClientRect().width + barWidth + mobileAdjust;
    root.dataset.timelineScrollWidth = timelineScrollWidth;
    timelineContainer.style.setProperty('--timeline-total-width', `${timelineScrollWidth + timelineElement.getBoundingClientRect().width}px`);
    timelineContainer.style.setProperty('--timeline-scroll-width', `${timelineScrollWidth}px`);

    timelineContainer.style.setProperty('--can-scroll', timelineScrollWidth > 0 ? '1' : '0');
}
let projects1frCallback = null;


function parseProjectLinks(links){
    return links.map(linkData => {
        [url, text] = linkData;
        link = url.replace(/^(https?:\/\/)?(www\.)?/, ''); // remove protocol and www
        let external = "";
        
        if (link.indexOf("github.com") === 0) {
            external = "external-link github";
        } else if (link.indexOf("roblox.com") === 0) {
            external = "external-link roblox";
        }

        return `<a href="${url}" class="${external}" target="_blank">${text}</a>`;
    }).join('');
}

function createProjectElement(project, parentElement, projectIdentifier, closeFocusCallback, clickCallback) {
    if (!project || !parentElement) { return; }
    if (!projectIdentifier) { return; }

    const projectElement = document.createElement("div");
    projectElement.classList.add("project");
    projectElement.id = projectIdentifier;
    
    // Unnecessary with 1fr min-width solution, leaving here just in-case (TODO: del later)
    /*
    let colDisplayLogic = '';
    for (let j = 0; j < projectSpan; j++) {
        colDisplayLogic += `var(--timeline-${i + j}-display, `;
    }
    colDisplayLogic += 'none' + ')'.repeat(projectSpan);

    projectElement.style.display = colDisplayLogic;
    */

    let demo = "";
    if (project.demoLink) {
        demo = `
        <h3 style="margin-bottom: 0;">Demo</h3>
        <sub style="margin-bottom: 10px; display: block;"><i>Note: Some demos may not work properly in minimized mode, try full screen or going to the <a onclick="event.stopPropagation();" href="${project.demoLink}" target="_blank">link</a></i></sub>
        <div class="project-demo-container" onclick="event.stopPropagation();">
            <div class="demo-btn" id="fullscreen-btn">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path class="max" d="M 14 11 L 20 5 M 14 5 L 20 5 L 20 11" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path class="max" d="M 11 14 L 5 20 M 5 14 L 5 20 L 11 20" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path class="min" d="M 15 10 L 21 4 M 15 4 L 15 10 L 21 10" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path class="min" d="M 10 15 L 4 21 M 4 15 L 10 15 L 10 21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </div>
            <div class="demo-btn" id="newtab-btn" onclick="window.open('${project.demoLink}', '_blank'); event.stopPropagation();">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 14 11 L 21 4 M 16 4 L 21 4 L 21 9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M 14 7 L 5 7 L 5 20 L 18 20 L 18 11" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </div>
            <div class="demo-btn" id="refresh-btn">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- r = 8, center = (12.5, 12.5), a1 = -40deg, a2 = -10deg -->
                <path d="M 18.6 17.6 A 8 8 0 1 1 20.4 13.9 L 22.4 11.9 M 20.4 13.9 L 18.4 11.9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </div>
            <iframe
                src="${project.demoLink}"
                title="${project.name} Demo"
                class="project-demo unselectable"
                sandbox="allow-scripts allow-same-origin allow-popups"
                width="100%" height="100%" frameborder="0" allow="fullscreen"
                loading="lazy">
            </iframe>
        </div>`;
    }
    let imgs = "";
    if (project.images && project.images.length > 0) {
        label = project.imageLabel ? project.imageLabel : "Images";
        imgs = `
        <h3 style="margin-bottom: 0;">${label}</h3>
        <div class="project-images">
        ${project.images.map(img => `<img src="${img}" alt="${project.name} image">`).join('')}
        </div>
        `;
    }

    let formattedDescription = project.formattedDescription ? project.formattedDescription : (project.description ? project.description : '');
    formattedDescription = formattedDescription.replace(/<br>/g, '<br/><br/>'); // add extra line break for spacing

    project.tags.forEach(tag => {
        if (project.formattedDescription) { return; } // if already formatted, don't reformat

        const words = tag.split(/[- ]/g);
        const regex = new RegExp(`(?:\\s|\\p{P})${words.join('[- ]')}(?:\\s|\\p{P})`, 'iu');
        const whitespaceRegex = /\s/g;

        let res = "";
        let tempDescription = formattedDescription;
        let index = tempDescription.search(regex);
        while (index !== -1) {
            const match = tempDescription.match(regex)[0];
            res += tempDescription.slice(0, index);
            const textStart = match[0];
            const textEnd = match[match.length - 1];
            const text = match.replace(/^(\s|\p{P})+|(\s|\p{P})+$/gu, "").replace(whitespaceRegex, "&nbsp;");
            res += `${textStart}<span class="tag ${tag} unselectable" onclick="event.stopPropagation();">${text}</span>${textEnd}`;
            tempDescription = tempDescription.slice(index + match.length);
            index = tempDescription.search(regex);
        }
        formattedDescription = res + tempDescription;
    });

    project.formattedDescription = formattedDescription; // save for later loading of project info

    projectElement.innerHTML = `
        <div class="project-content">
            <h2>${project.name}</h2>
            <div class="tags">
                ${project.tags.map(tag => {
                    if (projectIdentifier.startsWith(PINNED_PREFIX) && tag === "pinned") { return ""; } // hide pinned tag in pinned
                    return `<span class="tag ${tag} unselectable" onclick="event.stopPropagation();">${tag}</span>`}).join('')
                }
            </div>
            <p>${project.descriptionTeaser}</p>
            <span id="learn-more" class="unselectable">
            <span id="learn-more-text">Learn more</span>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 3 8 L 13 8 L 9 5 M 9 11 L 13 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </span>
            <div class="project-info">
                <div class="project-info-content">
                    <p>${formattedDescription}</p>
                    ${parseProjectLinks(project.links)}
                    ${imgs}
                    ${demo}
                </div>
            </div>
        </div>
    `;
    /* // TODO: can reuse broken link code
    if (project.link === "") {
        const linkElement = projectElement.querySelector("a");
        linkElement.setAttribute("tabindex", "-1");
        linkElement.setAttribute("aria-disabled", "true");
        // TODO: maybe make only clickable after focus (and fix losing focus after click)
        linkElement.addEventListener("click", (event) => {
            event.preventDefault();
        });
    }
    */
    parentElement.appendChild(projectElement);

    const learnMoreBtn = projectElement.querySelector("#learn-more");
    const learnMoreText = learnMoreBtn.querySelector("#learn-more-text");

    const imgElements = projectElement.querySelectorAll(".project-images > img");

    const tagContainer = projectElement.querySelector(".tags");
    const tagElements = tagContainer.querySelectorAll(".tag");

    let prevFrameTime = null;
    let scrollAnimProgress = 0;
    let timePerLine = 1.5; // seconds per line
    const scrollTags = (timestamp) => {
        if (!projectElement || !tagContainer || !tagElements || projectElement.parentElement === null) { return; }
        if (!prevFrameTime) prevFrameTime = timestamp;
        const deltaTime = (timestamp - prevFrameTime) / 1000;
        prevFrameTime = timestamp;

        if (!isInViewFunc(projectElement.getBoundingClientRect())) {
            window.requestAnimationFrame(scrollTags);
            return;
        };

        const start = tagElements[0].offsetTop;
        const end = tagElements[tagElements.length - 1].offsetTop;
        const lineCount = Math.round((end - start) / 32) + 1; // 26px height + 6px

        for (let i = 0; i < tagElements.length; i++) {
            const tag = tagElements[i];
            const line = Math.round((tag.offsetTop - start) / 32);
            tag.style.setProperty('--line', line);
        }

        tagContainer.style.setProperty('--line-count', lineCount);

        if (lineCount <= 2 || 
            (projectElement.classList.contains("project-focused") && window.innerWidth >= 550)
        ) {
            for (let i = 0; i < tagElements.length; i++) {
                const tag = tagElements[i];
                tag.style.setProperty('--offset', 0);
                tag.style.setProperty('transform', `translateY(0)`);
            }
            window.requestAnimationFrame(scrollTags);
            return; 
        }

        scrollAnimProgress += deltaTime / timePerLine;
        if (scrollAnimProgress >= lineCount) {
            scrollAnimProgress = 0;
        }
        //const scrollAmount = 32 * deltaTime / timePerLine; // 32px/1.5second
        const scrollOffset = -32 * scrollAnimProgress;

        for (let i = 0; i < tagElements.length; i++) {
            const tag = tagElements[i];
            //const currOffset = parseFloat(tag.style.getPropertyValue('--offset') || 0);
            const newOffset = scrollOffset; // currOffset - scrollAmount;
            
            const line = parseFloat(tag.style.getPropertyValue('--line') || 0);
            if (-newOffset / 32 >= line + 1) {
                let offset = newOffset + lineCount * 32;
                tag.style.setProperty('--offset', offset);
                tag.style.setProperty('transform', `translateY(${offset}px)`);
                continue;
            }
            tag.style.setProperty('--offset', newOffset);
            tag.style.setProperty('transform', `translateY(${newOffset}px)`);

        }

        window.requestAnimationFrame(scrollTags);
    }

    window.requestAnimationFrame(scrollTags);

    let focusedImage = null;
    const imgClickHandler = (event) => {
        event.stopPropagation();

        const img = event.target;

        if (focusedImage) {
            focusedImage.remove();
            focusedImage.removeEventListener("click", imgClickHandler);

            focusedImage = null;
            return;
        }

        const div = document.createElement("div");
        div.classList.add("fullscreen-img-container");

        const fullscreenImg = document.createElement("img");
        fullscreenImg.src = img.src;
        fullscreenImg.classList.add("fullscreen-img");
        div.appendChild(fullscreenImg);


        document.body.appendChild(div);

        focusedImage = div;
        div.addEventListener("click", imgClickHandler);
    }

    imgElements.forEach(img => {
        img.addEventListener("click", imgClickHandler);
    });

    const fullscreenBtn = projectElement.querySelector("#fullscreen-btn");
    let isFullscreen = false;
    const fullscreenHandler = () => {
        const elem = projectElement.querySelector(".project-demo-container");
        if (isFullscreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }

        let promise = null;
        if (elem.requestFullscreen) {
            promise = elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            promise = elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            promise = elem.msRequestFullscreen();
        }
        if (!promise) { return; }
        promise.then(() => {
            elem.classList.add("fullscreen");
            isFullscreen = true;
        });
    }
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", fullscreenHandler);
    }

    const refreshBtn = projectElement.querySelector("#refresh-btn");
    const refreshHandler = () => {
        const iframe = projectElement.querySelector("iframe");
        if (!iframe) { return; }
        
        const src = project.demoLink; // iframe.src;
        iframe.src = "";
        setTimeout(() => {
            iframe.src = src;
        }, 50);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener("click", refreshHandler);
    }

    let canCloseFocus = false;
    const closeFocus = (deltaScroll = 0) => {
        if (canCloseFocus === false) { return; }
        canCloseFocus = false;

        window.removeEventListener("wheel", scrollHandler, { passive: true });
        window.removeEventListener("touchmove", scrollHandler, { passive: true });
        
        window.removeEventListener("click", closeFocus);
        window.removeEventListener("keydown", escapeHandler);
        window.removeEventListener("resize", resizeHandler);

        root.style.setProperty('--project-opacity', '1');
        root.style.setProperty('--project-cursor', 'zoom-in');
        root.style.setProperty('--project-pointer-events', 'auto');
        projectElement.classList.remove("project-focused");

        //document.body.style.cursor = "default";
        document.body.classList.remove("project-focused");
        root.classList.remove("project-focused");

        learnMoreText.innerText = "Learn more";


        if (closeFocusCallback) { closeFocusCallback(projectElement, deltaScroll); }


        // thought the 1fr min-width solution could've replaced this, 
        // no idea why the scroll position is off after closing focus
        // current (bandaid?) solution:
        setTimeout(() => {
            unlockScroll();
        }, 100);
        // TODO: I think the answer going to be a dyanmic pos scroll (or just a custom scroll system overall)
        deltaScroll = 0;
        lockScroll(projectElement, {offset: -30 + deltaScroll, time: 100, instant: deltaScroll === 0});


        // optimization: reset iframe
        const iframe = projectElement.querySelector("iframe");
        if (iframe) {
            const src = iframe.src;
            iframe.src = "";
            setTimeout(() => {
                iframe.src = src;
            }, 200);
        }

        focusedProjectIdentifier = null;

        const url = new URL(window.location);
        url.searchParams.delete('project');
        window.history.pushState({}, '', url);
    }
    const scrollHandler = (event) => {
        let delta = 0;
        if (event && event.type === "wheel") {
            delta = event.deltaY;
        } else if (event && event.type === "touchmove") {
            const touch = event.touches[0];
            
            //console.log(event);

            delta = touch.clientY// - touch.startY;
            delta = 0
        }
        
        updateGradient();
        if (projectElement.classList.contains("project-focused")) {
            closeFocus(delta);
        }
    }
    const resizeHandler = () => {
        lockScroll(projectElement, {offset: -30, instant: true, time: 0});
        updateGradient();
    }
    const scrollBubblingOff = (event) => {
        updateGradient();
        if (projectElement.classList.contains("project-focused")) {
            event.stopPropagation();
        }
    }
    const escapeHandler = (event) => {
        if (event.key === "Escape") {
            closeFocus();
        }
    };
    const backgroundHoverHandler = (event) => {
        root.classList.remove("background-hover");
    }
    const backgroundLeaveHandler = (event) => {
        root.classList.add("background-hover");
    }
    const onClick = (event) => {
        //root.style.setProperty('--project-opacity', '0.5');
        if (projectElement.classList.contains("project-focused")) {
            // TODO: maybe add alternatives instead of clicking again to close
            //closeFocus();
            event.stopPropagation();
            return;
        }
        if (document.body.style.position === 'fixed') { return; } // if scroll locked, don't allow focus
        if (root.style.getPropertyValue('--project-opacity') == '0'){ return }
        projectElement.classList.add("project-focused");
        root.classList.add("project-focused");


        if (clickCallback) { clickCallback(projectElement); }


        root.style.setProperty('--project-opacity', '0');
        root.style.setProperty('--project-cursor', 'default');
        root.style.setProperty('--project-pointer-events', 'none');
        //document.body.style.cursor = "zoom-out";
        document.body.classList.add("project-focused");

        bufferElement.classList.add("buffer-active");
        setTimeout(() => {
            bufferElement.classList.remove("buffer-active");
        }, 300);

        learnMoreText.innerText = "Close (Esc)";

        setTimeout(() => {
            let top = projectElement.getBoundingClientRect().top + window.scrollY - 30;
            // 1fr min-width solution mitigated most issues
            // may have inadvertently caused issues with other ones
            // specifically full col projects, can leave this implmentation here
            // as a (bandaid?) solution
            lockScroll(projectElement, {offset: -30});

            setTimeout(() => {
                canCloseFocus = true;
            }, 50);
        }, 50);

        
        window.addEventListener("wheel", scrollHandler, { passive: true });
        window.addEventListener("touchmove", scrollHandler, { passive: true });
        
        projectElement.addEventListener("wheel", scrollBubblingOff, { passive: true });
        projectElement.addEventListener("touchmove", scrollBubblingOff, { passive: true });
        
        projectElement.addEventListener("mouseover", backgroundHoverHandler);
        projectElement.addEventListener("mouseleave", backgroundLeaveHandler);

        window.addEventListener("click", closeFocus);
        window.addEventListener("keydown", escapeHandler);
        window.addEventListener("resize", resizeHandler);

        focusedProjectIdentifier = projectIdentifier;

        const url = new URL(window.location);
        url.searchParams.set('project', projectIdentifier);
        window.history.pushState({}, '', url);
    }
    projectElement.addEventListener("click", onClick);

    const learnMoreBtnClick = (event) => {
        if (canCloseFocus === false) { return; }
        event.stopPropagation();
        closeFocus();
    }
    learnMoreBtn.addEventListener("click", learnMoreBtnClick);


    const isInViewFunc = (rect) => {
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    const updateGradient = () => {
        if (projectElement.parentElement === null) { 
            window.removeEventListener("mousemove", updateGradient);
            window.removeEventListener("scroll", updateGradient);
            return;
        }
        const rect = projectElement.getBoundingClientRect();
        
        if (!isInViewFunc(rect)) { return; }

        const relativeMouseX = mouseX - rect.left;
        const relativeMouseY = mouseY - rect.top;

        projectElement.style.setProperty('--mouse-x', `${relativeMouseX}px`);
        projectElement.style.setProperty('--mouse-y', `${relativeMouseY}px`);
    }
    window.addEventListener("mousemove", updateGradient);
    projectElement.addEventListener("mouseover", updateGradient);
    
    scrollCallbacks[projectIdentifier] = updateGradient;

    window.addEventListener("scroll", updateGradient);

    /*
    projectElement.addEventListener("mouseout", () => {
        //root.style.setProperty('--project-opacity', '1');
        /*
        window.scrollTo({
            top: projectElement.getBoundingClientRect().top + window.scrollY,
            behavior: 'smooth'
        });
        * /
    });
    */

    const inViewHandler = () => {
        const rect = projectElement.getBoundingClientRect();
        if (!isInViewFunc(rect)) { return; }
        
        projectElement.classList.add("in-view");
        window.removeEventListener("scroll", inViewHandler);
        window.removeEventListener("resize", inViewHandler);
    }

    window.addEventListener("scroll", inViewHandler);
    window.addEventListener("resize", inViewHandler);
    setTimeout(inViewHandler, 100); // Check if in view on load


    function removeListeners() {
        if (fullscreenBtn) {
            fullscreenBtn.removeEventListener("click", fullscreenHandler);
        }
        if (refreshBtn) {
            refreshBtn.removeEventListener("click", refreshHandler);
        }
        learnMoreBtn.removeEventListener("click", learnMoreBtnClick);
        projectElement.removeEventListener("click", onClick);

        window.removeEventListener("scroll", inViewHandler);
        window.removeEventListener("resize", inViewHandler);

        window.removeEventListener("mousemove", updateGradient);
        window.removeEventListener("scroll", updateGradient);
    }

    projectRemovingCallbacks[projectIdentifier] = removeListeners;

    projectClickCallbacks[projectIdentifier] = [onClick, closeFocus];

    return projectElement;
}

// creates project elements and timeline elements
function createProjectTimelines(timelines, start, end = new Date(), whitespaceTimeline) {
    const MonthCount = (end.getMonth() + end.getFullYear() * 12) - (start.getMonth() + start.getFullYear() * 12);

    // TODO: feel like could be implemented better
    projects1frCallback = () => {
        updateProject1fr(timelines.length);
    };
    updateProject1fr(timelines.length);
    window.addEventListener("resize", projects1frCallback);

    for (let i = 0; i < timelines.length; i++) {
        root.style.setProperty(`--timeline-${i}-display`, `block`);
        /*
        const projectTimelineElement = document.createElement("div");
        projectTimelineElement.classList.add("project-timeline");
        projectTimelineElement.setAttribute("data-index", i);
        //projectTimelineElement.style.gridTemplateRows = `repeat(${MonthCount}, ${MONTH_HEIGHT}px)`;
        projectTimelineElement.style.gridTemplateRows = whitespaceTimeline.map(value => {
            const isWhitespace = (value & 1) === 1;
            const monthCount = value >> 1; // ignore isWhitespace bit
            if (isWhitespace) { // is whitespace
                return `repeat(${monthCount}, ${COLLAPSED_MONTH_HEIGHT}px)`;
            }
            return `repeat(${monthCount}, ${MONTH_HEIGHT}px)`;
            //return `repeat(${monthCount}, auto)`;
        }).join(' ');
        */

        //timelineElement.style.gridTemplateRows = `repeat(${MonthCount}, ${MONTH_HEIGHT}px)`;
        //timelineElement.style.gridTemplateRows = projectTimelineElement.computedStyleMap().get("grid-template-rows").toString();
        
        timelineElement.style.gridTemplateRows = whitespaceTimeline.map(value => {
            const isWhitespace = (value & 1) === 1;
            const monthCount = value >> 1; // ignore isWhitespace bit
            if (isWhitespace) { // is whitespace
                return `repeat(${monthCount}, ${COLLAPSED_MONTH_HEIGHT}px)`;
            }
            //return `repeat(${monthCount}, ${MONTH_HEIGHT}px)`;
            return `repeat(${monthCount}, auto)`;
        }).join(' ');
        //timelineElement.style.gridTemplateColumns = `6em repeat(${timelines.length}, 1fr)`;
        timelineElement.style.gridTemplateColumns = `6em ${'1fr '.repeat(timelines.length)}`;

        let prevProjectEnd = end;

        timelines[i].forEach(project => {
            const totalRows = project.time.reduce((acc, timeRange) => {
                const start = timeRange[0];
                const end = timeRange[1] || start;
                const monthCount = ((end.getFullYear() * 12 + end.getMonth()) - (start.getFullYear() * 12 + start.getMonth())) + 1;
                return acc + monthCount;
            }, 0);

            let projectStart = project.earliestTime;
            let projectEnd = project.latestTime;

            // TODO: improve/standardize timeline overlap logic, kinda spaghetti rn
            let projectSpan = 1;
            for (let j = i + 1; j < timelines.length; j++) {
                const nextTimeline = timelines[j];
                let overlaps = false;

                for (let k = 0; k < nextTimeline.length; k++) {
                    const nextProject = nextTimeline[k];

                    for (let l = 0; l < nextProject.time.length; l++) {
                        const nextStart = nextProject.time[l][0];
                        const nextEnd = nextProject.time[l][1] || nextStart;

                        if ((projectStart <= nextEnd) && (projectEnd >= nextStart)) {
                            overlaps = true;
                            break;
                        }
                    }
                    if (overlaps) break;
                }
                if (overlaps) break;
                projectSpan++;
            }

            project.time.forEach(timeRange => {
                const projectStart = timeRange[0];
                const projectEnd = timeRange[1] || projectStart;

                const currRowCount = ((projectEnd.getFullYear() * 12 + projectEnd.getMonth()) - (projectStart.getFullYear() * 12 + projectStart.getMonth())) + 1;


                const closeFocusCallback = (deltaScroll = 0) => {
                    //timelineElement.style.gridTemplateColumns = `6em repeat(${timelines.length}, 1fr)`;
                    timelineElement.style.gridTemplateColumns = `6em ${'1fr '.repeat(timelines.length)}`;
                    timelineElement.style.gridGap = "";

                    for (let j = 0; j < timelines.length; j++) {
                        setTimeout(() => {
                            root.style.setProperty(`--timeline-${j}-display`, `block`);
                        }, 30);
                    }
                }
                const clickCallback = () => {
                    // unnecessary with 1fr min-width solution, leaving here just in-case (TODO: del later)
                    /* 
                    for (let j = 0; j < timelines.length; j++) {
                        if (j >= i && j < i + projectSpan) { continue; }
                        root.style.setProperty(`--timeline-${j}-display`, ``);
                    }
                    */

                    let repeat1 = '0fr '.repeat(i);
                    let thisCol = '1fr '.repeat(projectSpan);
                    let repeat2 = '0fr '.repeat(timelines.length - i - projectSpan);
                    setTimeout(() => {
                        let gridGap = getComputedStyle(timelineElement).getPropertyValue('column-gap') || "0px";
                        if (gridGap === "normal") { gridGap = "0px"; }
                        timelineElement.style.gridTemplateColumns = `calc(6em + ${gridGap}) ${repeat1} ${thisCol} ${repeat2}`;
                        timelineElement.style.gridGap = `0px`;
                    }, 20);
                };
                
                const projectId = `t-${project.id}`; // timeline (t)
                const projectElement = createProjectElement(project, timelineElement, projectId, closeFocusCallback, clickCallback);
                projectElement.style.gridRowStart = ((end.getMonth() + end.getFullYear() * 12) - (projectEnd.getMonth() + projectEnd.getFullYear() * 12)) + 1;
                projectElement.style.gridRowEnd = ((end.getMonth() + end.getFullYear() * 12) - (projectStart.getMonth() + projectStart.getFullYear() * 12)) + 2;
                //projectTimelineElement.appendChild(projectElement);
                projectElement.style.gridColumn = `${i + 2} / span ${projectSpan}`;

                if (projectSpan > 1) {
                    projectElement.style.setProperty('--project-col-start', i + 1);
                    projectElement.style.setProperty('--project-spans-more', 1);
                } else {
                    projectElement.style.setProperty('--project-col-start', timelines.length + 1);
                    projectElement.style.setProperty('--project-spans-more', 0);
                }
                projectElement.style.setProperty('--project-max-height', `calc(${currRowCount} / ${totalRows} * 100vh - 60px)`);
            });
        });

        //projectContainer.appendChild(projectTimelineElement);
    }
}

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
        monthBar.classList.add("month-bar", "unselectable", "timeline-element");
        monthBar.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span 1`;
        monthBar.style.gridColumn = `1 / span 1`;
        timelineElement.appendChild(monthBar);

        const monthCell = document.createElement("div");
        monthCell.classList.add("month-cell", "unselectable", "timeline-element");
        monthCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span 1`;
        monthCell.style.gridColumn = `1 / span 1`;
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
            yearCell.classList.add("year-cell", "unselectable", "timeline-element");
            yearCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span ${currentMonth === 11 ? 12 : (currentMonth + 1)}`;
            yearCell.style.gridColumn = `1 / span 1`;
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
            decadeCell.classList.add("decade-cell", "unselectable", "timeline-element");
            decadeCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span ${(currentYear + 1) % 10 === 0 ? 120 : (currentYear % 10) * 12 + currentMonth}`;
            decadeCell.style.gridColumn = `1 / span 1`;
            if (currentYear - 10 <= startYear){
                decadeCell.style.gridRow = `${gridRowStart(currentYear, currentMonth)} / span ${clampedGridRowSpan(currentYear, currentMonth)}`;
            }
            timelineElement.appendChild(decadeCell);

            const decadeElement = document.createElement("span");
            decadeElement.classList.add("decade");
            decadeElement.innerText = `${Math.floor(currentYear / 10)}`;
            decadeCell.appendChild(decadeElement);
        }

        /*
        if (isFirst && isCurrent) {
            monthElement.classList.add("current");
            monthElement.innerText = "Now";
            monthElement.style.top = "-20px";
        }
        */
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

    const timelineBackground = document.createElement("div");
    timelineBackground.classList.add("timelineBackground");
    timelineElement.appendChild(timelineBackground);
}

function createProjectsPinned() {
    const pinnedProjects = getPinnedProjects();
    pinnedProjects.forEach((project, index) => {
        const closeFocusCallback = () => {

        }

        const clickCallback = () => {

        }

        const projectId = `${PINNED_PREFIX}${project.id}`; // pinned (p)
        const projectElement = createProjectElement(project, pinnedProjectsContainer, projectId, closeFocusCallback, clickCallback);
        projectElement.style.setProperty('--project-max-height', `calc(100vh - 60px)`);
        
    });
}

// TODO: not sure if this system should stay, might be nice for nav or sharing links, 
// but could also be annoying
function urlParamsLoad() {
    const url = new URL(window.location);
    const projectParam = url.searchParams.get('project');

    //console.log("projectParam", projectParam, "focusedProjectIdentifier", focusedProjectIdentifier);
   
    // if a project is already focused, and the url param is different/null, close the focused project
    if (focusedProjectIdentifier && focusedProjectIdentifier !== projectParam &&
        projectClickCallbacks[focusedProjectIdentifier] && 
        projectClickCallbacks[focusedProjectIdentifier][1]
    ) {
        setTimeout(() => {
            projectClickCallbacks[focusedProjectIdentifier][1]();
        }, 20);
    }

    // if the url param is null, don't open any project
    if (!projectParam) { 
        return;
    }

    const projectElement = document.getElementById(projectParam);
    // if the url param is valid, open the project
    if (projectClickCallbacks[projectParam] && projectClickCallbacks[projectParam][0] && projectElement) { 
        projectElement.classList.add("in-view");
        setTimeout(() => {
            projectClickCallbacks[projectParam][0]();
        }, 20);
    } else {
        // if the url param is invalid, remove it from the url
        url.searchParams.delete('project');
        window.history.replaceState({}, '', url);
    }
}

function decodeBase64(encoded) {
    return decodeURIComponent(atob(encoded).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
const encoded = "c2FtaXIxMDAxMDAzMDZAZ21haWwuY29t";
const decoded = decodeBase64(encoded);
document.querySelectorAll(".external-link.email").forEach(el => {
    if (!decoded) return;
    el.href = `mailto:${decoded}`;
});

createTimeline();
createProjectsPinned();

window.addEventListener("popstate", urlParamsLoad);
window.addEventListener("load", urlParamsLoad);