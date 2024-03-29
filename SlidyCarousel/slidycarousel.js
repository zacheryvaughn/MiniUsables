document.querySelectorAll('.carousel').forEach(function(carousel) {
    let speed = 0;

    const updateScrollSpeed = (e) => {
        const { left, width } = carousel.getBoundingClientRect();
        const x = e.clientX - left;
        const edgeThreshold = width * 0.25;

        speed = x < edgeThreshold
            ? -20 * (1 - x / edgeThreshold)
            : x > width - edgeThreshold
            ? 20 * (x - (width - edgeThreshold)) / edgeThreshold
            : 0;
    };

    const animateScroll = () => {
        if (speed !== 0) carousel.scrollLeft += speed;
        requestAnimationFrame(animateScroll);
    };

    carousel.addEventListener('mousemove', updateScrollSpeed);
    carousel.addEventListener('mouseenter', updateScrollSpeed);
    carousel.addEventListener('mouseleave', () => speed = 0);

    requestAnimationFrame(animateScroll);
});