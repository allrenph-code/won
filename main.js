document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate');
    const numberSpans = document.querySelectorAll('.number');

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
});