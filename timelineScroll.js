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

let isTouching = false;
container.addEventListener('touchstart', (e) => {
    if (document.body.style.position === 'fixed') return;

    if (e.touches.length !== 1) return; // only handle single touch

    const startX = e.touches[0].clientX;
    const startScrollLeft = targetScrollLeft;

    const onTouchMove = (e) => {
        if (e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - startX;

        // TODO: test responsiveness
        const timelineWidth = timelineElement.getBoundingClientRect().width - getEmInPixels(timelineElement, 6) - 20;
        const percentDelta = deltaX * (maxScroll / timelineWidth);
        targetScrollLeft = startScrollLeft - percentDelta;
        targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));
    };

    const onTouchEnd = () => {
        isTouching = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    };

    isTouching = true;
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
});

scrollbarThumb.addEventListener('mousedown', (e) => {
    if (document.body.style.position === 'fixed') return; // if scroll locked, don't allow scroll

    const startX = e.clientX;
    const startScrollLeft = targetScrollLeft;
    const onMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        // css equation: left: calc(var(--scroll-percent) - (var(--timeline-thumb-width) + 6px) * (var(--scroll-percent) / 100%));
        // left = scrollPercent - (thumbWidth + 6px) * (scrollPercent / 100)
        // left = scrollPercent * (1 - (thumbWidth + 6px) / 100)
        // scrollPercent = left / (1 - (thumbWidth + 6px) / 100)

        // first attempt (using css equations)
        //const deltaScrollPercent = (deltaX / (1 - (thumbWidth + 6)));
        //targetScrollLeft = startScrollLeft + (deltaX * maxScroll / scrollbar.getBoundingClientRect().width);
        

        // TOOD: math is a little guess & check, figure out the real calc
        const scrollbarWidth = scrollbar.getBoundingClientRect().width;
        const thumbWidth = scrollbarThumb.getBoundingClientRect().width + 6;

        const thumbWidthPercent = scrollbarWidth > 0 ? (thumbWidth / scrollbarWidth) : 100;

        const deltaScroll = (deltaX / thumbWidthPercent);
        targetScrollLeft = startScrollLeft + (deltaScroll);
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
    const easingFactor = isTouching ? 0.3 : 0.15;
    scrollLeft += (targetScrollLeft - scrollLeft) * easingFactor; // easing factor
    applyScrollPosition(scrollLeft);
    requestAnimationFrame(animate);
}

animate();