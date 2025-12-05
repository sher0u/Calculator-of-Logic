// Алгоритм Маркова - Исправленная версия

class MarkovAlgorithm {
    constructor() {
        this.rules = [];
        this.currentString = '';
        this.steps = [];
        this.stepCount = 0;
        this.maxSteps = 1000;
        this.isRunning = false;
    }
    
    initialize(rulesText, input) {
        this.rules = [];
        this.currentString = input;
        this.stepCount = 0;
        this.steps = [];
        this.isRunning = true;
        
        this.parseRules(rulesText);
        this.addStep(input, 'Начальная строка');
    }
    
    parseRules(rulesText) {
        const lines = rulesText.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            // Поддержка разных форматов разделителей
            let parts;
            if (line.includes('->')) {
                parts = line.split('->').map(part => part.trim());
            } else if (line.includes('→')) {
                parts = line.split('→').map(part => part.trim());
            } else {
                return;
            }
            
            if (parts.length === 2) {
                let pattern = parts[0];
                let replacement = parts[1];
                let isFinal = false;
                
                // Проверка на завершающее правило (начинается с точки)
                if (pattern.startsWith('.')) {
                    isFinal = true;
                    pattern = pattern.substring(1);
                }
                
                // Проверка на завершающее правило (заканчивается точкой у замены)
                if (replacement.endsWith('.') && replacement !== '.') {
                    isFinal = true;
                    replacement = replacement.slice(0, -1);
                }
                
                this.rules.push({
                    pattern: pattern,
                    replacement: replacement,
                    isFinal: isFinal,
                    original: line
                });
            }
        });
    }
    
    step() {
        if (this.stepCount >= this.maxSteps) {
            this.addStep(this.currentString, 'Достигнут лимит шагов');
            this.isRunning = false;
            return false;
        }
        
        // Проходим по правилам в порядке приоритета
        for (const rule of this.rules) {
            const index = this.currentString.indexOf(rule.pattern);
            
            if (index !== -1) {
                // Применяем правило (заменяем первое вхождение)
                this.currentString = 
                    this.currentString.substring(0, index) + 
                    rule.replacement + 
                    this.currentString.substring(index + rule.pattern.length);
                
                this.stepCount++;
                this.addStep(this.currentString, `Применено правило: ${rule.original}`);
                
                // Если правило финальное, останавливаемся
                if (rule.isFinal) {
                    this.addStep(this.currentString, 'Применено завершающее правило');
                    this.isRunning = false;
                    return false;
                }
                
                return true;
            }
        }
        
        // Нет применимых правил
        this.addStep(this.currentString, 'Нет применимых правил');
        this.isRunning = false;
        return false;
    }
    
    run() {
        while (this.step()) {
            // Продолжаем выполнение
        }
    }
    
    getCurrentString() {
        return this.currentString;
    }
    
    addStep(string, description) {
        this.steps.push({
            step: this.steps.length,
            string: string,
            description: description
        });
    }
    
    getSteps() {
        return this.steps;
    }
    
    getResult() {
        return this.currentString;
    }
}

// Глобальные переменные
let markovAlgorithm = null;
let markovInterval = null;

function runMarkovAlgorithm() {
    const input = document.getElementById('markov-input').value.trim();
    const rules = document.getElementById('markov-rules').value.trim();
    
    if (!input) {
        alert('Пожалуйста, введите входную строку');
        return;
    }
    
    if (!rules) {
        alert('Пожалуйста, введите правила алгоритма Маркова');
        return;
    }
    
    // Останавливаем предыдущее выполнение
    if (markovInterval) {
        clearInterval(markovInterval);
    }
    
    // Инициализируем алгоритм
    markovAlgorithm = new MarkovAlgorithm();
    markovAlgorithm.initialize(rules, input);
    
    displayMarkovSteps();
    
    // Запускаем автоматическое выполнение
    markovInterval = setInterval(() => {
        if (!markovAlgorithm.step()) {
            clearInterval(markovInterval);
            markovInterval = null;
            displayMarkovResult();
        }
        displayMarkovSteps();
    }, 500);
}

function stepMarkovAlgorithm() {
    if (!markovAlgorithm) {
        // Создаем алгоритм если его нет
        const input = document.getElementById('markov-input').value.trim();
        const rules = document.getElementById('markov-rules').value.trim();
        
        if (!input || !rules) {
            alert('Введите входную строку и правила');
            return;
        }
        
        markovAlgorithm = new MarkovAlgorithm();
        markovAlgorithm.initialize(rules, input);
    }
    
    if (!markovAlgorithm.isRunning) {
        alert('Алгоритм завершил работу');
        return;
    }
    
    if (!markovAlgorithm.step()) {
        displayMarkovResult();
    }
    displayMarkovSteps();
}

function resetMarkovAlgorithm() {
    if (markovInterval) {
        clearInterval(markovInterval);
        markovInterval = null;
    }
    
    markovAlgorithm = null;
    
    const stepsContainer = document.getElementById('markov-steps');
    if (stepsContainer) {
        stepsContainer.innerHTML = '<div class="text-muted text-center">Шаги выполнения появятся здесь</div>';
    }
    
    const resultContainer = document.getElementById('markov-result');
    if (resultContainer) {
        resultContainer.innerHTML = '';
    }
}

function displayMarkovSteps() {
    if (!markovAlgorithm) return;
    
    const container = document.getElementById('markov-steps');
    const steps = markovAlgorithm.getSteps();
    
    let html = '';
    steps.forEach((step, index) => {
        const isCurrent = index === steps.length - 1;
        const stepClass = isCurrent ? 'markov-step current' : 'markov-step';
        
        html += `<div class="${stepClass}">
            <strong>Шаг ${step.step}:</strong> "${step.string}"<br>
            <small class="text-muted">${step.description}</small>
        </div>`;
    });
    
    if (container) {
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    }
}

function displayMarkovResult() {
    if (!markovAlgorithm) return;
    
    const resultContainer = document.getElementById('markov-result');
    const result = markovAlgorithm.getResult();
    const steps = markovAlgorithm.getSteps();
    
    let html = `<div class="alert alert-success">
        <h6><i class="fas fa-check-circle"></i> Результат</h6>
        <div class="formula-display">${result || '(пустая строка)'}</div>
        <p><strong>Всего шагов:</strong> ${markovAlgorithm.stepCount}</p>
        <p><strong>Статус:</strong> ${markovAlgorithm.stepCount >= markovAlgorithm.maxSteps ? 'Остановлено по лимиту' : 'Завершено'}</p>
    </div>`;
    
    if (resultContainer) resultContainer.innerHTML = html;
}

// Примеры алгоритмов Маркова
function loadMarkovExample(example) {
    let input, rules;
    
    switch (example) {
        case 'doubling':
            // Удвоение символов
            input = 'abc';
            rules = `a -> aa
b -> bb
c -> cc`;
            break;
            
        case 'reverse':
            // Упрощенная замена символов
            input = 'abc';
            rules = `ab -> ba
bc -> cb
ac -> ca`;
            break;
            
        case 'remove':
            // Удаление всех 'a'
            input = 'aabaca';
            rules = `a -> `;
            break;
            
        case 'replace':
            // Замена символов
            input = 'ababab';
            rules = `ab -> ba`;
            break;
            
        case 'parentheses':
            // Упрощение скобок
            input = '((()))';
            rules = `() -> `;
            break;
            
        case 'binary':
            // Преобразование унарного в двоичное (упрощенно)
            input = '11111';
            rules = `11 -> 1
1 -> .1`;
            break;
            
        default:
            return;
    }
    
    const inputElement = document.getElementById('markov-input');
    if (inputElement) inputElement.value = input;
    
    const rulesElement = document.getElementById('markov-rules');
    if (rulesElement) rulesElement.value = rules;
}

// Продвинутые возможности

function optimizeMarkovRules(rulesText) {
    const rules = rulesText.split('\n').filter(line => line.trim());
    const optimized = [];
    const seen = new Set();
    
    // Удаляем дубликаты и упорядочиваем по приоритету
    rules.forEach(rule => {
        if (!seen.has(rule)) {
            seen.add(rule);
            optimized.push(rule);
        }
    });
    
    return optimized.join('\n');
}

function analyzeMarkovComplexity(rulesText) {
    const rules = rulesText.split('\n').filter(line => line.trim());
    
    let complexity = 0;
    let hasRecursion = false;
    let hasTermination = false;
    
    rules.forEach(rule => {
        const parts = rule.split('->').map(part => part.trim());
        if (parts.length !== 2) return;
        
        const [pattern, replacement] = parts;
        
        // Проверяем сложность паттерна
        complexity += pattern.length;
        
        // Проверяем рекурсию
        if (replacement.includes(pattern)) {
            hasRecursion = true;
        }
        
        // Проверяем завершение
        if (pattern.startsWith('.') || replacement.endsWith('.')) {
            hasTermination = true;
        }
    });
    
    return {
        complexity: complexity,
        ruleCount: rules.length,
        hasRecursion: hasRecursion,
        hasTermination: hasTermination
    };
}

// Экспорт функций для глобального использования
if (typeof window !== 'undefined') {
    window.runMarkovAlgorithm = runMarkovAlgorithm;
    window.stepMarkovAlgorithm = stepMarkovAlgorithm;
    window.resetMarkovAlgorithm = resetMarkovAlgorithm;
    window.loadMarkovExample = loadMarkovExample;
    window.optimizeMarkovRules = optimizeMarkovRules;
    window.analyzeMarkovComplexity = analyzeMarkovComplexity;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MarkovAlgorithm,
        runMarkovAlgorithm,
        stepMarkovAlgorithm,
        resetMarkovAlgorithm,
        loadMarkovExample,
        optimizeMarkovRules,
        analyzeMarkovComplexity
    };
}
