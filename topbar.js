const topBar = document.getElementById('topBar');

const btns = topBar.querySelectorAll('div');

btns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const offset = parseInt(btn.getAttribute('data-offset'), 10) || 0;
        const targetSection = document.getElementById(targetId);
        if (targetSection && document.body.style.position !== 'fixed') {
            //targetSection.scrollIntoView({ behavior: 'smooth' });
            window.scrollTo({
                top: targetSection.offsetTop + offset,
                behavior: 'smooth'
            });
        }
    });
});