const zoomMenu = document.getElementById('menu');
const zoomMenuItems = zoomMenu.querySelectorAll('.menuitem');

const style = getComputedStyle(zoomMenuItems[0]);
const [zoomMinSize, zoomMaxSize, zoomDistance, initialBorderRadius] = ['--base-size', '--max-size', '--zoom-distance', 'borderRadius'].map(prop => 
  parseFloat(style.getPropertyValue(prop) || style[prop])
);

function adjustItemSize(e, reset = false) {
  zoomMenuItems.forEach(item => {
    if (reset) {
      item.style.width = item.style.height = `${zoomMinSize}px`;
      item.style.borderRadius = `${initialBorderRadius}px`;
      return;
    }
    const { left, right } = item.getBoundingClientRect();
    const withinBounds = e.clientX >= left && e.clientX <= right;
    const closestEdgeDistance = withinBounds ? 0 : Math.min(Math.abs(e.clientX - left), Math.abs(e.clientX - right));
    const newSize = withinBounds ? zoomMaxSize : zoomMinSize + (zoomMaxSize - zoomMinSize) * Math.max(0, (zoomDistance - closestEdgeDistance) / zoomDistance);
    const newBorderRadius = initialBorderRadius * (newSize / zoomMinSize);

    item.style.width = item.style.height = `${newSize}px`;
    item.style.borderRadius = `${newBorderRadius}px`;
  });
}

zoomMenu.addEventListener('mousemove', (e) => adjustItemSize(e));
zoomMenu.addEventListener('mouseleave', () => adjustItemSize(null, true));