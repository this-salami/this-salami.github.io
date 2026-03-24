const projects = [
    {
        name: "fg",
        description: "desc",
        link: "",
        time: [],
        tags: ["lua"]
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
        tags: ["python"]
    },
    {
        name: "scrim",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css"]
    },
    {
        name: "dsa",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css"]
    },
    {
        name: "es",
        description: "",
        link: "",
        time: [],
        tags: ["python"]
    },
    {
        name: "egep",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css"]
    },
    {
        name: "lg",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css"]
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
        tags: ["js", "html", "css", "php", "react"]
    },
    {
        name: "db",
        description: "",
        link: "",
        time: [],
        tags: ["python"]
    },
    {
        name: "bnm",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css"]
    },
    {
        name: "msmc",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css"]
    },
    {
        name: "wds",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css"]
    },
    {
        name: "ts",
        description: "",
        link: "",
        time: [],
        tags: ["js", "html", "css"]
    }
]

const projectContainer = document.getElementById("project-container");
projects.forEach(project => {
    const projectElement = document.createElement("div");
    projectElement.classList.add("project");
    projectElement.innerHTML = `
        <h3>${project.name}</h3>
        <div class="tags">
            ${project.tags.map(tag => `<span class="${tag}">${tag}</span>`).join('')}
        </div>
        <p>${project.description}</p>
        <a href="${project.link}">Learn more</a>
    `;
    projectContainer.appendChild(projectElement);
})