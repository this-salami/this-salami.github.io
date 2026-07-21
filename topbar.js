const topBar = document.getElementById('topBar');

const btns = topBar.querySelectorAll('div');

let menuOpened = false;

btns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;

        const offset = parseInt(btn.getAttribute('data-offset'), 10) || 0;
        const targetSection = document.getElementById(targetId);
        if (targetSection && document.body.style.position !== 'fixed') {
            window.scrollTo({
                top: targetSection.offsetTop + offset,
                behavior: 'smooth'
            });
        } else if (menuOpened) {
            menuOpened = menuBtns.classList.toggle('menuOpened');
            unlockScroll();
            window.scrollTo({
                top: targetSection.offsetTop + offset,
                behavior: 'smooth'
            });
        }
    });
});

const menuIcon = document.getElementById('menuIcon');
const menuBtns = document.getElementById('menuBtns');

menuIcon.addEventListener('click', () => {
    if (menuIcon.style.display === 'none') return;
    if (document.body.style.position === 'fixed' && menuOpened === false) return; // if scroll locked, don't allow focus

    setTimeout(() => {
        menuOpened = menuBtns.classList.toggle('menuOpened');

        if (menuOpened) {
            lockScroll();
        } else {
            unlockScroll();
        }
    }, 10);
});

menuBtns.addEventListener('click', (event) => {
    event.stopPropagation();

    if (menuOpened === false) return;

    const backdrop = window.getComputedStyle(menuBtns, '::before');

    if (!backdrop || backdrop.display !== 'block') return;

    if (event.offsetX <= 0) {
        menuBtns.classList.remove('menuOpened');
        unlockScroll();
        menuOpened = false;
    }
});