let scrollLeft = 0;
let targetScrollLeft = 0;

const container = document.getElementById('timelineContainer');
// init in index.js
//const timelineElement = document.getElementById('timeline');
const scrollbar = document.getElementById('timelineHorizontalScrollbar');
const scrollbarThumb = document.getElementById('timelineHorizontalScrollbarThumb');

let maxScroll = 0;
const updateMaxScroll = () => {
    maxScroll = parseFloat(root.dataset.timelineScrollWidth) || 0;
    
    if (maxScroll <= 0 || document.body.style.position === 'fixed') {
        scrollbar.style.display = 'none';
    } else {
        scrollbar.style.display = '';
    }
}
updateMaxScroll();

window.addEventListener('resize', () => {
    updateMaxScroll();
});


const applyScrollPosition = (scrollLeft) => {
    scrollLeft = Math.max(0, Math.min(scrollLeft, maxScroll));

    container.style.setProperty('--horizontal-scroll', `${-scrollLeft}px`);
}

container.addEventListener('wheel', (e) => {
    if (document.body.style.position === 'fixed') return; // if scroll locked, don't allow scroll
    if (e.deltaX === 0) return; // only handle horizontal scroll

    targetScrollLeft += e.deltaX;
    

    updateMaxScroll();

    targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));
    
}, { passive: false });

container.addEventListener('touchstart', (e) => {
    if (document.body.style.position === 'fixed') return;

    if (e.touches.length !== 1) return; // only handle single touch

    const startX = e.touches[0].clientX;
    const startScrollLeft = targetScrollLeft;

    const onTouchMove = (e) => {
        if (e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - startX;
        targetScrollLeft = startScrollLeft - deltaX;
        targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));
    };

    const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
});

scrollbarThumb.addEventListener('mousedown', (e) => {
    if (document.body.style.position === 'fixed') return; // if scroll locked, don't allow scroll

    const startX = e.clientX;
    const startScrollLeft = targetScrollLeft;
    const onMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        targetScrollLeft = startScrollLeft + deltaX;
        targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));
    }
    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});


function animate() {
    scrollLeft += (targetScrollLeft - scrollLeft) * 0.15; // easing factor
    applyScrollPosition(scrollLeft);
    requestAnimationFrame(animate);
}

animate();