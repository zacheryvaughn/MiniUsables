document.addEventListener('DOMContentLoaded', async function() {
    console.log("Document loaded.");
    console.log("Starting script...");

    const targetBlob = document.querySelector('#target-blob');

    const style = getComputedStyle(targetBlob);

    // Fetch and parse CSS Variables with defaults
    let stepsValue = style.getPropertyValue('--steps').trim();
    stepsValue = stepsValue !== '' ? stepsValue : 'auto'; // Default to 'auto' if not specified

    const durationValue = style.getPropertyValue('--duration').trim();
    const durationInSeconds = durationValue ? parseFloat(durationValue) : 2; // Default to 2 seconds if not specified

    const alignment = style.getPropertyValue('--alignment').trim();

    const matches = alignment.match(/(-?\d+)px\s+(-?\d+)px/);
    const [_, xValue, yValue] = matches || [null, '0', '0'];
    const horizontalOffset = parseInt(xValue, 10);
    const verticalOffset = parseInt(yValue, 10);
    console.log("Alignment offset:", horizontalOffset, "x", verticalOffset, "y");

    const fps = 60; // Assume 60 fps for "auto"
    const totalSteps = stepsValue === 'auto' ? durationInSeconds * fps : parseInt(stepsValue, 10);
    console.log("Total steps:", totalSteps, "(for each svg transition)");

    let animationDuration = durationInSeconds * 1000;
    console.log("Duration:", animationDuration / 1000, "seconds (for each svg transition)");
    console.log("Animation speed:", (totalSteps / durationInSeconds), "fps");
    
    targetBlob.addEventListener('mousedown', function() {
        console.log("Hey, that tickles!");
        animationDuration = 200;
        return animationDuration;
    });

    let currentStep = 0;
    let currentBlobIndex = 0;
    const blobsFolderPath = '/MiniUsables/SquishyBlob/blobs/';

    async function countBlobFiles() {
        try {
            const response = await fetch(blobsFolderPath);
            console.log("Found '" + blobsFolderPath + "' SVG folder.");
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const links = doc.querySelectorAll('a');
            let count = 0;
            links.forEach(link => {
                if (link.href.endsWith('.svg')) {
                    count++;
                }
            });
            return count;
        } catch (error) {
            console.log("'" + blobsFolderPath + "' SVG folder missing.");
            return 0;
        }
    }

    const numberOfBlobs = await countBlobFiles();
    console.log("Found " + numberOfBlobs + " SVG files in blobs folder.");

    // Custom easing function with increased speed towards start and end
    function customEase(t) {
        return Math.pow(t, 1.5) / (Math.pow(t, 1.5) + Math.pow(1 - t, 1.5));
    }

    function interpolate(start, end, step, totalSteps) {
        return start + (end - start) * (step / totalSteps);
    }

    function parsePathString(pathString) {
        const pathArray = pathString.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
        return pathArray.map(segment => {
            const char = segment[0];
            const points = segment.slice(1).trim().split(/[ ,]+/).map(Number);
            return { char, points };
        });
    }

    function adjustSvg() {
        const blobContainer = document.querySelector('#blob-container');
        const svgElement = document.querySelector('#target-blob');
        const gElement = svgElement.querySelector('g');
        const width = blobContainer.offsetWidth;
        const height = blobContainer.offsetHeight;
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
        const translateX = (width / 2) + horizontalOffset;
        const translateY = (height / 2) + verticalOffset;
        gElement.setAttribute('transform', `translate(${translateX} ${translateY})`);
    }

    async function fetchSvgPaths() {
        const paths = [];
        for (let i = 1; i <= numberOfBlobs; i++) {
            const response = await fetch(`${blobsFolderPath}blob${i}.svg`);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "image/svg+xml");
            const pathData = doc.querySelector('path').getAttribute('d');
            paths.push(pathData);
        }
        return paths;
    }

    async function startAnimation() {
        adjustSvg(); // Dynamically adjust SVG before starting animation

        const paths = await fetchSvgPaths();
        console.log("Calculating SVG path steps...");

        const targetPath = document.querySelector('#target-blob path');

        const parsedPaths = paths.map(parsePathString);
        console.log("SVG path steps ready.");

        function animateStep() {
            if (currentStep >= totalSteps) {
                currentStep = 0;
                currentBlobIndex = (currentBlobIndex + 1) % parsedPaths.length;
            }

            // Apply easing to the current step progression
            let easedStep = customEase(currentStep / totalSteps);

            let nextBlobIndex = (currentBlobIndex + 1) % parsedPaths.length;
            let interpolatedPath = parsedPaths[currentBlobIndex].map((cmd, i) => {
                if (parsedPaths[nextBlobIndex][i]) {
                    const interpolatedPoints = cmd.points.map((point, pointIndex) => {
                        return interpolate(point, parsedPaths[nextBlobIndex][i].points[pointIndex], easedStep, 1);
                    });
                    return `${cmd.char} ${interpolatedPoints.join(' ')}`;
                }
                return `${cmd.char} ${cmd.points.join(' ')}`;
            }).join(' ');

            targetPath.setAttribute('d', interpolatedPath);
            currentStep++;
        }

        console.log("Starting animation...");
        setInterval(animateStep, animationDuration / totalSteps);
        console.log("Animation started.");
    }

    startAnimation();
});
