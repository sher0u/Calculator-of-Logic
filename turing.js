// Машина Тьюринга - Исправленная версия

class TuringMachine {
    constructor() {
        this.tape = [];
        this.headPosition = 0;
        this.currentState = 'q0';
        this.rules = new Map();
        this.steps = 0;
        this.maxSteps = 1000;
        this.isRunning = false;
        this.isFinished = false;
    }
    
    initialize(input, rulesText) {
        // Инициализация ленты
        this.tape = ['B', ...input.split(''), 'B', 'B', 'B', 'B', 'B'];
        this.headPosition = 1;
        this.currentState = 'q0';
        this.steps = 0;
        this.isRunning = false;
        this.isFinished = false;
        
        // Парсинг правил
        this.parseRules(rulesText);
    }
    
    parseRules(rulesText) {
        this.rules.clear();
        const lines = rulesText.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const parts = line.split(',').map(part => part.trim());
            if (parts.length === 5) {
                const [currentState, currentSymbol, newSymbol, direction, newState] = parts;
                const key = `${currentState},${currentSymbol}`;
                this.rules.set(key, {
                    newSymbol: newSymbol,
                    direction: direction,
                    newState: newState
                });
            }
        });
    }
    
    step() {
        if (this.isFinished || this.steps >= this.maxSteps) {
            this.isRunning = false;
            return false;
        }
        
        // Проверяем финальные состояния
        if (this.currentState === 'qf' || this.currentState === 'qF' || this.currentState === 'halt') {
            this.isFinished = true;
            this.isRunning = false;
            return false;
        }
        
        const currentSymbol = this.tape[this.headPosition] || 'B';
        const key = `${this.currentState},${currentSymbol}`;
        const rule = this.rules.get(key);
        
        if (!rule) {
            // Нет правила - останавливаемся
            this.isFinished = true;
            this.isRunning = false;
            return false;
        }
        
        // Применяем правило
        this.tape[this.headPosition] = rule.newSymbol;
        
        // Двигаем головку
        if (rule.direction === 'R') {
            this.headPosition++;
            if (this.headPosition >= this.tape.length) {
                this.tape.push('B');
            }
        } else if (rule.direction === 'L') {
            this.headPosition--;
            if (this.headPosition < 0) {
                this.tape.unshift('B');
                this.headPosition = 0;
            }
        }
        // N - не двигаем
        
        // Меняем состояние
        this.currentState = rule.newState;
        this.steps++;
        
        // Проверяем финальное состояние после перехода
        if (this.currentState === 'qf' || this.currentState === 'qF' || this.currentState === 'halt') {
            this.isFinished = true;
            this.isRunning = false;
            return false;
        }
        
        return true;
    }
    
    getTapeDisplay() {
        const display = [];
        const start = Math.max(0, this.headPosition - 5);
        const end = Math.min(this.tape.length, this.headPosition + 6);
        
        for (let i = start; i < end; i++) {
            display.push({
                symbol: this.tape[i] || 'B',
                isActive: i === this.headPosition
            });
        }
        
        return display;
    }
    
    getResult() {
        // Удаляем пустые символы с краев
        let result = this.tape.join('');
        result = result.replace(/^B+/, '').replace(/B+$/, '');
        return result || '(пустая строка)';
    }
}

// Глобальные переменные
let turingMachine = null;
let turingInterval = null;

function runTuringMachine() {
    const input = document.getElementById('turing-input').value.trim();
    const rules = document.getElementById('turing-rules').value.trim();
    
    if (!input) {
        alert('Пожалуйста, введите входную строку');
        return;
    }
    
    if (!rules) {
        alert('Пожалуйста, введите правила машины Тьюринга');
        return;
    }
    
    // Останавливаем предыдущее выполнение
    if (turingInterval) {
        clearInterval(turingInterval);
    }
    
    // Инициализируем машину
    turingMachine = new TuringMachine();
    turingMachine.initialize(input, rules);
    turingMachine.isRunning = true;
    
    displayTuringMachine();
    
    // Запускаем автоматическое выполнение
    turingInterval = setInterval(() => {
        if (!turingMachine.step()) {
            clearInterval(turingInterval);
            turingInterval = null;
            displayTuringResult();
        }
        displayTuringMachine();
    }, 500);
}

function stepTuringMachine() {
    if (!turingMachine) {
        // Создаем машину если её нет
        const input = document.getElementById('turing-input').value.trim();
        const rules = document.getElementById('turing-rules').value.trim();
        
        if (!input || !rules) {
            alert('Введите входную строку и правила');
            return;
        }
        
        turingMachine = new TuringMachine();
        turingMachine.initialize(input, rules);
    }
    
    if (turingMachine.isFinished) {
        alert('Машина Тьюринга завершила работу');
        return;
    }
    
    if (!turingMachine.step()) {
        displayTuringResult();
    }
    displayTuringMachine();
}

function resetTuringMachine() {
    if (turingInterval) {
        clearInterval(turingInterval);
        turingInterval = null;
    }
    
    turingMachine = null;
    
    const tapeContainer = document.getElementById('turing-tape');
    if (tapeContainer) {
        tapeContainer.innerHTML = '<div class="text-white text-center w-100">Лента появится после запуска</div>';
    }
    
    const stateElement = document.getElementById('current-state');
    if (stateElement) stateElement.textContent = 'q0';
    
    const stepElement = document.getElementById('step-count');
    if (stepElement) stepElement.textContent = '0';
    
    const resultElement = document.getElementById('turing-result');
    if (resultElement) resultElement.innerHTML = '';
}

function displayTuringMachine() {
    if (!turingMachine) return;
    
    const tapeContainer = document.getElementById('turing-tape');
    const tapeDisplay = turingMachine.getTapeDisplay();
    
    let html = '';
    tapeDisplay.forEach(cell => {
        const cellClass = cell.isActive ? 'turing-cell active' : 'turing-cell';
        html += `<div class="${cellClass}">${cell.symbol}</div>`;
    });
    
    if (tapeContainer) tapeContainer.innerHTML = html;
    
    const stateElement = document.getElementById('current-state');
    if (stateElement) stateElement.textContent = turingMachine.currentState;
    
    const stepElement = document.getElementById('step-count');
    if (stepElement) stepElement.textContent = turingMachine.steps;
}

function displayTuringResult() {
    if (!turingMachine) return;
    
    const resultContainer = document.getElementById('turing-result');
    const result = turingMachine.getResult();
    
    let html = `<div class="alert alert-success">
        <h6><i class="fas fa-check-circle"></i> Результат</h6>
        <div class="formula-display">${result}</div>
        <p><strong>Финальное состояние:</strong> ${turingMachine.currentState}</p>
        <p><strong>Шагов выполнено:</strong> ${turingMachine.steps}</p>
    </div>`;
    
    if (resultContainer) resultContainer.innerHTML = html;
}

// Примеры машин Тьюринга
function loadTuringExample(example) {
    let input, rules;
    
    switch (example) {
        case 'increment':
            // Инкремент унарного числа: 111 -> 1111
            input = '111';
            rules = `q0,1,1,R,q0
q0,B,1,N,qf`;
            break;
            
        case 'decrement':
            // Декремент унарного числа: 111 -> 11
            input = '111';
            rules = `q0,1,1,R,q0
q0,B,B,L,q1
q1,1,B,N,qf`;
            break;
            
        case 'copy':
            // Копирование строки: 101 -> 101101
            input = '101';
            rules = `q0,0,X,R,q1
q0,1,Y,R,q2
q0,B,B,N,qf
q1,0,0,R,q1
q1,1,1,R,q1
q1,B,0,L,q3
q2,0,0,R,q2
q2,1,1,R,q2
q2,B,1,L,q3
q3,0,0,L,q3
q3,1,1,L,q3
q3,X,0,R,q0
q3,Y,1,R,q0`;
            break;
            
        case 'binary_increment':
            // Инкремент двоичного числа: 101 -> 110
            input = '101';
            rules = `q0,0,0,R,q0
q0,1,1,R,q0
q0,B,B,L,q1
q1,0,1,N,qf
q1,1,0,L,q1
q1,B,1,N,qf`;
            break;
            
        default:
            return;
    }
    
    const inputElement = document.getElementById('turing-input');
    if (inputElement) inputElement.value = input;
    
    const rulesElement = document.getElementById('turing-rules');
    if (rulesElement) rulesElement.value = rules;
}

// Экспорт функций для глобального использования
if (typeof window !== 'undefined') {
    window.runTuringMachine = runTuringMachine;
    window.stepTuringMachine = stepTuringMachine;
    window.resetTuringMachine = resetTuringMachine;
    window.loadTuringExample = loadTuringExample;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TuringMachine,
        runTuringMachine,
        stepTuringMachine,
        resetTuringMachine,
        loadTuringExample
    };
}
