document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate');
    const numberSpans = document.querySelectorAll('.number');
    const themeToggle = document.getElementById('theme-toggle');
    const canvas = document.getElementById('whiteboard');
    const clearBoardBtn = document.getElementById('clear-board');
    const saveBoardBtn = document.getElementById('save-board');
    const penColorInput = document.getElementById('pen-color');
    const context = canvas.getContext('2d');

    let drawing = false;
    let lastPoint = null;

    generateBtn.addEventListener('click', () => {
        const lottoNumbers = generateLottoNumbers();
        displayNumbers(lottoNumbers);
    });

    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayNumber(span, number) {
        span.textContent = number;
        span.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            span.style.transform = 'translateY(0)';
        }, 300);
    }

    function displayNumbers(numbers) {
        numberSpans.forEach((span, index) => {
            setTimeout(() => {
                displayNumber(span, numbers[index]);
            }, index * 200);
        });
    }

    function applyTheme(isDarkMode) {
        document.body.classList.toggle('dark', isDarkMode);
        themeToggle.textContent = isDarkMode ? '라이트모드' : '다크모드';
        themeToggle.setAttribute('aria-label', `${isDarkMode ? '라이트' : '다크'}모드 전환`);
        if (!drawing) {
            resetBoardBackground();
        }
    }

    function resetBoardBackground() {
        context.save();
        context.fillStyle = document.body.classList.contains('dark') ? '#0b1220' : '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }

    function resizeCanvas() {
        const prev = document.createElement('canvas');
        prev.width = canvas.width;
        prev.height = canvas.height;
        prev.getContext('2d').drawImage(canvas, 0, 0);

        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(300, Math.floor(rect.width));
        canvas.height = Math.max(220, Math.floor(window.innerHeight * 0.42));
        resetBoardBackground();
        context.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, canvas.width, canvas.height);
    }

    function getPoint(event) {
        const rect = canvas.getBoundingClientRect();
        if (event.touches && event.touches[0]) {
            return {
                x: event.touches[0].clientX - rect.left,
                y: event.touches[0].clientY - rect.top
            };
        }
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function startDrawing(event) {
        drawing = true;
        lastPoint = getPoint(event);
    }

    function draw(event) {
        if (!drawing) {
            return;
        }

        const point = getPoint(event);
        context.beginPath();
        context.moveTo(lastPoint.x, lastPoint.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = penColorInput.value;
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.stroke();
        lastPoint = point;
    }

    function endDrawing() {
        drawing = false;
        lastPoint = null;
    }

    function saveBoardImage() {
        const link = document.createElement('a');
        link.download = `whiteboard-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    themeToggle.addEventListener('click', () => {
        const isDarkMode = !document.body.classList.contains('dark');
        localStorage.setItem('preferred-theme', isDarkMode ? 'dark' : 'light');
        applyTheme(isDarkMode);
    });

    clearBoardBtn.addEventListener('click', resetBoardBackground);
    saveBoardBtn.addEventListener('click', saveBoardImage);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mouseleave', endDrawing);
    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        startDrawing(event);
    }, { passive: false });
    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        draw(event);
    }, { passive: false });
    canvas.addEventListener('touchend', endDrawing);

    window.addEventListener('resize', resizeCanvas);

    const preferredTheme = localStorage.getItem('preferred-theme');
    const useDark = preferredTheme ? preferredTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(useDark);
    resizeCanvas();
});
