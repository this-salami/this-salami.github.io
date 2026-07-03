function updatePinnedProjectsGrid() {
    const pinnedProjects = pinnedProjectsContainer.querySelectorAll(".project");
    const containerWidth = pinnedProjectsContainer.clientWidth - 20; // 10px margin
    
    let projectWidth = 300;
    if (containerWidth <= 320) { // small screen = 1 project per row
        projectWidth = containerWidth - 20; // 10px padding for projects
    }

    const projectsPerRow = Math.floor(containerWidth / (projectWidth + 20));
    const totalRows = Math.ceil(pinnedProjects.length / projectsPerRow);

    console.log(projectsPerRow);

    pinnedProjectsContainer.style.setProperty("--project-width", `${projectWidth}px`);
    pinnedProjectsContainer.style.setProperty("--projects-per-row", projectsPerRow);

    pinnedProjects.forEach((project, index) => {
        const row = Math.floor(index / projectsPerRow);
        const col = index % projectsPerRow;
        project.style.setProperty("--col", `${col}`);
        project.style.setProperty("--row", `${row}`);
    });
}

window.addEventListener("resize", () => {
    updatePinnedProjectsGrid();
});

updatePinnedProjectsGrid();