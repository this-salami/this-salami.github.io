function updatePinnedProjectsGrid() {
    const pinnedProjects = pinnedProjectsContainer.querySelectorAll(".project");
    const containerWidth = pinnedProjectsContainer.clientWidth - 20; // 10px margin
    
    let projectWidth = 300;
    if (containerWidth <= 320) { // small screen = 1 project per row
        projectWidth = containerWidth - 20; // 10px padding for projects
    }

    const projectsPerRow = Math.floor(containerWidth / (projectWidth + 20));
    const totalRows = Math.ceil(pinnedProjects.length / projectsPerRow);

    const lastRowProjectsCount = pinnedProjects.length % projectsPerRow || projectsPerRow;
    const lastRowCountRowParity = lastRowProjectsCount % 2 === projectsPerRow % 2; // true = same parity, false = different parity

    console.log(projectsPerRow);

    pinnedProjectsContainer.style.setProperty("--project-width", `${projectWidth}px`);
    pinnedProjectsContainer.style.setProperty("--projects-per-row", projectsPerRow);
    if (lastRowCountRowParity) {
        pinnedProjectsContainer.style.setProperty("--real-col-count", projectsPerRow);
    } else { // if parity is different, double the cols will let last row be centered
        pinnedProjectsContainer.style.setProperty("--real-col-count", projectsPerRow * 2);
    }

    pinnedProjects.forEach((project, index) => {
        const row = Math.floor(index / projectsPerRow);
        let col = index % projectsPerRow;

        if (row === totalRows - 1) {
            col += (projectsPerRow - lastRowProjectsCount) / 2; // center the last row
        }

        // if parity is different, double the "real" col for last row to center it
        if (!lastRowCountRowParity) {
            project.style.setProperty("--col-span", "2");
            project.style.setProperty("--real-col", `${col * 2}`);
        } else {
            project.style.setProperty("--col-span", "1");
            project.style.setProperty("--real-col", `${col}`);
        }
        
        project.style.setProperty("--col", `${col}`);
        project.style.setProperty("--row", `${row}`);
    });
}

window.addEventListener("resize", () => {
    updatePinnedProjectsGrid();
});

updatePinnedProjectsGrid();