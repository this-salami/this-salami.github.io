const projects = [
    {
        name: "fg",
        description: "desc",
        link: "",
        time: [],
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
        time: [],
        tags: ["python"]
    },
    {
        name: "jsb",
        description: "",
        link: "",
        time: [],
        tags: ["js"]
    },
    {
        name: "hsc",
        description: "",
        link: "",
        time: [],
        tags: ["python", "game-design", "ui", "front-end"]
    },
    {
        name: "scrim",
        description: "",
        link: "",
        time: [],
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
        time: [],
        tags: ["js", "html", "css"]
    },
    {
        name: "cs",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "php", "react", "front-end"]
    },
    {
        name: "db",
        description: "",
        link: "",
        time: [],
        tags: ["python"] // maybe back-end TODO: idk
    },
    {
        name: "bnm",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    {
        name: "msmc",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    {
        name: "wds",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end"]
    },
    {
        name: "ts",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css", "ui", "front-end"]
    }
]

const tags = new Set();
const projectContainer = document.getElementById("project-container");
const filterContainer = document.getElementById("filter-container");
const filterCheckboxContainer = document.getElementById("checkboxes");

projects.forEach(project => {
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
    project.tags.forEach(tag => tags.add(tag));

    projectContainer.appendChild(projectElement);
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