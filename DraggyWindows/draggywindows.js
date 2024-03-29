const dragArea = document.getElementById('dragarea');
let isDragging = false;
let offsetX, offsetY;
let currentZIndex = 1;

function getDragAreaBounds() {
    const style = window.getComputedStyle(dragArea);
    const border = {
        left: parseInt(style.borderLeftWidth, 10),
        top: parseInt(style.borderTopWidth, 10),
        right: parseInt(style.borderRightWidth, 10),
        bottom: parseInt(style.borderBottomWidth, 10)
    };

    return {
        left: dragArea.offsetLeft + border.left,
        top: dragArea.offsetTop + border.top,
        right: dragArea.offsetLeft + dragArea.clientWidth + border.right,
        bottom: dragArea.offsetTop + dragArea.clientHeight + border.bottom
    };
}

dragArea.addEventListener('mousedown', (e) => {
    const dragWindow = e.target.closest('.dragwindow');
    if (!dragWindow) return;

    isDragging = true;
    offsetX = e.clientX - dragWindow.offsetLeft;
    offsetY = e.clientY - dragWindow.offsetTop;
    currentZIndex++;
    dragWindow.style.zIndex = currentZIndex;
    e.preventDefault();

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(e) {
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        const bounds = getDragAreaBounds();

        newX = Math.max(bounds.left, Math.min(newX, bounds.right - dragWindow.offsetWidth));
        newY = Math.max(bounds.top, Math.min(newY, bounds.bottom - dragWindow.offsetHeight));

        dragWindow.style.left = `${newX}px`;
        dragWindow.style.top = `${newY}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
});
