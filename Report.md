# Математическая логика и теория алгоритмов
## Объяснение всех алгоритмов и исходный код

---

## 1. Таблицы истинности

### Что это?
Таблица истинности — это таблица, показывающая все возможные комбинации значений переменных и результат логической функции.

### Как работает:
1. Для n переменных создаём 2^n строк (все комбинации 0 и 1)
2. Для каждой строки вычисляем значение функции
3. Записываем результат (0 или 1)

### Пример:
**Функция:** A AND B

| A | B | A AND B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

**Вектор функции:** 0001

### Исходный код:

```javascript
// Генерация имён переменных (A, B, C, ...)
function getVariableNames(count) {
    const names = [];
    for (let i = 0; i < count; i++) {
        names.push(String.fromCharCode(65 + i)); // 65 = 'A'
    }
    return names;
}

// Получение двоичного представления числа
function getBinaryValues(number, bits) {
    return number.toString(2).padStart(bits, '0').split('').map(bit => parseInt(bit));
}

// Генерация таблицы истинности
function generateTruthTable() {
    const functionInput = document.getElementById('function-input').value.trim();
    const variablesCount = parseInt(document.getElementById('variables-count').value);
    
    const variables = getVariableNames(variablesCount);
    const rows = Math.pow(2, variablesCount); // 2^n строк
    const results = [];
    
    for (let i = 0; i < rows; i++) {
        const values = getBinaryValues(i, variablesCount);
        const context = {};
        variables.forEach((variable, index) => {
            context[variable] = values[index];
        });
        
        const result = evaluateLogicalExpression(functionInput, context);
        results.push({ values: values, result: result });
    }
    
    return { variables: variables, results: results };
}

// Вычисление логического выражения
function evaluateLogicalExpression(expression, context) {
    let processed = expression.toUpperCase();
    
    // Заменяем переменные на их значения
    Object.keys(context).forEach(variable => {
        const regex = new RegExp(`\\b${variable}\\b`, 'g');
        processed = processed.replace(regex, context[variable]);
    });
    
    // Заменяем логические операторы на JavaScript операторы
    processed = processed
        .replace(/\bNOT\b/g, '!')
        .replace(/\bAND\b/g, '&&')
        .replace(/\bOR\b/g, '||')
        .replace(/\bXOR\b/g, '!==');
    
    // Вычисляем результат
    return Function('"use strict"; return (' + processed + ')')() ? 1 : 0;
}
```

---

## 2. ДНФ (Дизъюнктивная нормальная форма)

### Что это?
ДНФ — это представление функции как дизъюнкции (OR) конъюнкций (AND).

### Алгоритм:
1. Находим все строки таблицы истинности, где f = 1
2. Для каждой такой строки строим конъюнкцию:
   - Если переменная = 1, берём её как есть (A)
   - Если переменная = 0, берём отрицание (A')
3. Соединяем все конъюнкции через OR (∨)

### Пример:
**Вектор:** 0110

**ДНФ:** (A'∧B) ∨ (A∧B')

### Исходный код:

```javascript
function calculateDNF() {
    const vectorInput = document.getElementById('dnf-function').value.trim();
    
    // Преобразуем строку в массив битов
    const bits = vectorInput.split('').map(bit => parseInt(bit));
    const variableCount = Math.log2(bits.length); // Количество переменных
    
    const variables = getVariableNames(variableCount);
    const implicants = []; // Конституенты единицы
    
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 1) { // Ищем строки где f = 1
            const binary = i.toString(2).padStart(variableCount, '0');
            const terms = [];
            
            for (let j = 0; j < binary.length; j++) {
                // Если бит = 1, берём переменную, иначе её отрицание
                terms.push(binary[j] === '1' ? variables[j] : variables[j] + "'");
            }
            implicants.push(terms.join('∧')); // Соединяем через AND
        }
    }
    
    // Соединяем все конъюнкции через OR
    const expression = implicants.length > 0 ? implicants.join(' ∨ ') : '0';
    return expression;
}
```

---

## 3. СКНФ (Совершенная конъюнктивная нормальная форма)

### Что это?
СКНФ — это представление функции как конъюнкции (AND) дизъюнкций (OR).

### Алгоритм:
1. Находим все строки таблицы истинности, где f = 0
2. Для каждой такой строки строим дизъюнкцию:
   - Если переменная = 0, берём её как есть (A)
   - Если переменная = 1, берём отрицание (A')
3. Соединяем все дизъюнкции через AND (∧)

### Исходный код:

```javascript
function calculateCNF() {
    const vectorInput = document.getElementById('dnf-function').value.trim();
    
    const bits = vectorInput.split('').map(bit => parseInt(bit));
    const variableCount = Math.log2(bits.length);
    
    const variables = getVariableNames(variableCount);
    const clauses = []; // Конституенты нуля
    
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 0) { // Ищем строки где f = 0
            const binary = i.toString(2).padStart(variableCount, '0');
            const terms = [];
            
            for (let j = 0; j < binary.length; j++) {
                // ОБРАТНАЯ логика: если бит = 0, берём переменную, иначе отрицание
                terms.push(binary[j] === '0' ? variables[j] : variables[j] + "'");
            }
            clauses.push('(' + terms.join('∨') + ')'); // Соединяем через OR
        }
    }
    
    // Соединяем все дизъюнкции через AND
    const expression = clauses.length > 0 ? clauses.join(' ∧ ') : '1';
    return expression;
}
```

---

## 4. Карты Карно

### Что это?
Карта Карно — это графический метод минимизации логических функций.

### Алгоритм:
1. Строим таблицу с кодом Грея (соседние ячейки отличаются на 1 бит)
2. Заполняем значениями функции
3. Группируем соседние единицы

### Исходный код:

```javascript
function buildKarnaughMap() {
    const vectorInput = document.getElementById('karnaugh-function').value.trim();
    const variablesCount = parseInt(document.getElementById('karnaugh-vars').value);
    
    const bits = vectorInput.split('').map(bit => parseInt(bit));
    let map;
    
    switch (variablesCount) {
        case 2:
            // 2x2 карта
            map = [[bits[0], bits[1]], [bits[2], bits[3]]];
            break;
        case 3:
            // 2x4 карта (код Грея: 00, 01, 11, 10)
            map = [
                [bits[0], bits[1], bits[3], bits[2]], 
                [bits[4], bits[5], bits[7], bits[6]]
            ];
            break;
        case 4:
            // 4x4 карта
            map = [
                [bits[0], bits[1], bits[3], bits[2]],
                [bits[4], bits[5], bits[7], bits[6]],
                [bits[12], bits[13], bits[15], bits[14]],
                [bits[8], bits[9], bits[11], bits[10]]
            ];
            break;
    }
    
    return map;
}
```

---

## 5. Полином Жегалкина

### Что это?
Полином Жегалкина — это представление логической функции через XOR (⊕) и AND (·).

**Общий вид:** f = a₀ ⊕ a₁·x₁ ⊕ a₂·x₂ ⊕ a₃·x₁·x₂ ⊕ ...

---

### Метод 1: Треугольник Паскаля

#### Алгоритм:
1. Записываем вектор функции в первую строку
2. Каждый элемент следующей строки = XOR двух соседних элементов сверху
3. Коэффициенты — первый столбец треугольника

#### Исходный код:

```javascript
function calculateZhegalkinTriangle(bits, variableCount) {
    // Построение треугольника (метод Паскаля)
    const triangle = [];
    let currentRow = [...bits];
    triangle.push([...currentRow]);
    
    // Строим треугольник пока не останется один элемент
    while (currentRow.length > 1) {
        const nextRow = [];
        for (let i = 0; i < currentRow.length - 1; i++) {
            // XOR двух соседних элементов
            nextRow.push(currentRow[i] ^ currentRow[i + 1]);
        }
        triangle.push([...nextRow]);
        currentRow = nextRow;
    }
    
    // Коэффициенты — первый столбец треугольника
    const coefficients = triangle.map(row => row[0]);
    
    return coefficients;
}
```

---

### Метод 2: Табличный метод

#### Алгоритм:
1. Строим таблицу со всеми термами: 1, A, B, AB, C, AC, BC, ABC...
2. Коэффициент aₛ = XOR всех f(x), где x содержит все единичные биты S

#### Формула:
**aₛ = ⊕ f(x) для всех x, где (x AND S) = S**

#### Исходный код:

```javascript
function calculateZhegalkinTable(bits, variableCount) {
    const variables = getVariableNames(variableCount);
    const n = bits.length; // 2^variableCount
    
    // Генерируем все термы полинома: 1, A, B, AB, C, AC, BC, ABC...
    const terms = [];
    for (let i = 0; i < n; i++) {
        const binary = i.toString(2).padStart(variableCount, '0');
        let termName = '';
        for (let j = 0; j < binary.length; j++) {
            if (binary[j] === '1') {
                termName += variables[j];
            }
        }
        terms.push({
            index: i,
            name: termName || '1',
            vars: binary
        });
    }
    
    // Вычисляем коэффициенты
    // Коэффициент a_S = XOR f(x) по всем x >= S (поэлементно)
    const coefficients = [];
    for (let S = 0; S < n; S++) {
        let coef = 0;
        for (let x = 0; x < n; x++) {
            // x >= S означает, что для каждого бита S=1, 
            // соответствующий бит x тоже = 1
            if ((x & S) === S) {
                coef ^= bits[x]; // XOR
            }
        }
        coefficients.push(coef);
    }
    
    return coefficients;
}

// Построение строки полинома из коэффициентов
function buildPolynomialString(coefficients, variableCount) {
    const variables = getVariableNames(variableCount);
    const terms = [];
    
    coefficients.forEach((coef, index) => {
        if (coef === 1) {
            if (index === 0) {
                terms.push('1'); // Свободный член
            } else {
                const binary = index.toString(2).padStart(variableCount, '0');
                const termVars = [];
                for (let i = 0; i < binary.length; i++) {
                    if (binary[i] === '1') termVars.push(variables[i]);
                }
                terms.push(termVars.join('·')); // Произведение переменных
            }
        }
    });
    
    return terms.length > 0 ? terms.join(' ⊕ ') : '0';
}
```

---

## 6. Машина Тьюринга

### Что это?
Машина Тьюринга — это абстрактная вычислительная модель:
- **Лента** — бесконечная последовательность ячеек с символами
- **Головка** — читает/пишет символы, двигается влево/вправо
- **Состояния** — внутреннее состояние машины
- **Правила перехода** — определяют поведение машины

### Формат правила:
```
текущее_состояние, читаемый_символ, записываемый_символ, направление, новое_состояние
```

### Исходный код:

```javascript
// Структура машины Тьюринга
let turingMachine = {
    tape: [],           // Лента (массив символов)
    headPosition: 0,    // Позиция головки
    currentState: 'q0', // Текущее состояние
    rules: new Map(),   // Правила перехода
    steps: 0,           // Счётчик шагов
    maxSteps: 1000,     // Максимум шагов (защита от зацикливания)
};

// Парсинг правил из текста
function parseTuringRules(rulesText) {
    const rules = new Map();
    const lines = rulesText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length === 5) {
            const [currentState, currentSymbol, newSymbol, direction, newState] = parts;
            // Ключ: "состояние,символ"
            const key = `${currentState},${currentSymbol}`;
            rules.set(key, { newSymbol, direction, newState });
        }
    });
    
    return rules;
}

// Инициализация машины
function initTuringMachine(input, rulesText) {
    // Создаём ленту: B + входная строка + несколько B
    turingMachine.tape = ['B', ...input.split(''), 'B', 'B', 'B', 'B', 'B'];
    turingMachine.headPosition = 1; // Начинаем с первого символа входа
    turingMachine.currentState = 'q0';
    turingMachine.rules = parseTuringRules(rulesText);
    turingMachine.steps = 0;
}

// Один шаг машины Тьюринга
function stepTuringOnce() {
    // Проверка на остановку
    if (turingMachine.steps >= turingMachine.maxSteps) return false;
    if (turingMachine.currentState === 'qf' || 
        turingMachine.currentState === 'qF' || 
        turingMachine.currentState === 'halt') return false;
    
    // Читаем текущий символ
    const currentSymbol = turingMachine.tape[turingMachine.headPosition] || 'B';
    
    // Ищем правило
    const key = `${turingMachine.currentState},${currentSymbol}`;
    const rule = turingMachine.rules.get(key);
    
    if (!rule) return false; // Нет правила — останавливаемся
    
    // Применяем правило:
    // 1. Записываем новый символ
    turingMachine.tape[turingMachine.headPosition] = rule.newSymbol;
    
    // 2. Меняем состояние
    turingMachine.currentState = rule.newState;
    
    // 3. Двигаем головку
    if (rule.direction === 'R') {
        turingMachine.headPosition++;
        // Расширяем ленту если нужно
        if (turingMachine.headPosition >= turingMachine.tape.length) {
            turingMachine.tape.push('B');
        }
    } else if (rule.direction === 'L') {
        turingMachine.headPosition--;
        // Расширяем ленту слева если нужно
        if (turingMachine.headPosition < 0) {
            turingMachine.tape.unshift('B');
            turingMachine.headPosition = 0;
        }
    }
    // 'N' — не двигаем
    
    turingMachine.steps++;
    
    // Проверяем финальное состояние
    return turingMachine.currentState !== 'qf' && 
           turingMachine.currentState !== 'qF' && 
           turingMachine.currentState !== 'halt';
}

// Получение результата
function getTuringResult() {
    // Удаляем пустые символы B и возвращаем результат
    return turingMachine.tape.join('').replace(/B/g, '').trim();
}
```

### Пример: Инкремент унарного числа (111 → 1111)

**Правила:**
```
q0,1,1,R,q0
q0,B,1,N,qf
```

**Пошаговое выполнение:**
```
Шаг 0: Состояние q0, лента: [B] 1 1 1 B, читаем 1
       Правило: q0,1,1,R,q0 → пишем 1, идём вправо, остаёмся в q0

Шаг 1: Состояние q0, лента: B [1] 1 1 B, читаем 1
       Правило: q0,1,1,R,q0 → пишем 1, идём вправо

Шаг 2: Состояние q0, лента: B 1 [1] 1 B, читаем 1
       Правило: q0,1,1,R,q0 → пишем 1, идём вправо

Шаг 3: Состояние q0, лента: B 1 1 [1] B, читаем 1
       Правило: q0,1,1,R,q0 → пишем 1, идём вправо

Шаг 4: Состояние q0, лента: B 1 1 1 [B], читаем B
       Правило: q0,B,1,N,qf → пишем 1, остаёмся, переходим в qf

Результат: 1111
```

---

## 7. Алгоритм Маркова

### Что это?
Алгоритм Маркова — это система подстановок строк.

### Правила работы:
1. Правила упорядочены по приоритету (сверху вниз)
2. Ищем **первое** вхождение образца в строке
3. Заменяем его на замену
4. Возвращаемся к **первому** правилу
5. Повторяем пока есть применимые правила

### Завершающие правила:
`.образец -> замена` — точка означает остановку после применения

### Исходный код:

```javascript
// Структура алгоритма Маркова
let markovAlgorithm = {
    currentString: '',  // Текущая строка
    rules: [],          // Массив правил
    steps: [],          // История шагов
    stepCount: 0,       // Счётчик шагов
    maxSteps: 100,      // Максимум шагов
};

// Парсинг правил
function parseMarkovRules(rulesText) {
    const rules = [];
    const lines = rulesText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        let parts;
        // Поддержка разных форматов стрелки
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
            
            // Проверка на завершающее правило (точка в начале)
            if (pattern.startsWith('.')) {
                isFinal = true;
                pattern = pattern.substring(1);
            }
            
            rules.push({
                pattern: pattern,
                replacement: replacement,
                isFinal: isFinal,
                original: line
            });
        }
    });
    
    return rules;
}

// Один шаг алгоритма Маркова
function stepMarkovOnce() {
    // Защита от зацикливания
    if (markovAlgorithm.stepCount >= markovAlgorithm.maxSteps) {
        return false;
    }
    
    // Проходим по правилам в порядке приоритета
    for (const rule of markovAlgorithm.rules) {
        // Ищем первое вхождение образца
        const index = markovAlgorithm.currentString.indexOf(rule.pattern);
        
        if (index !== -1) {
            // Применяем правило: заменяем первое вхождение
            markovAlgorithm.currentString = 
                markovAlgorithm.currentString.substring(0, index) + 
                rule.replacement + 
                markovAlgorithm.currentString.substring(index + rule.pattern.length);
            
            markovAlgorithm.stepCount++;
            
            // Сохраняем шаг в историю
            markovAlgorithm.steps.push({
                step: markovAlgorithm.stepCount,
                string: markovAlgorithm.currentString,
                description: `Применено правило: ${rule.original}`
            });
            
            // Если правило завершающее — останавливаемся
            if (rule.isFinal) {
                return false;
            }
            
            return true; // Продолжаем с первого правила
        }
    }
    
    // Нет применимых правил — останавливаемся
    return false;
}
```

### Пример: Замена символов (abc → xyz)

**Правила:**
```
a -> x
b -> y
c -> z
```

**Пошаговое выполнение:**
```
Шаг 0: "abc" (начальная строка)

Шаг 1: Ищем 'a' в "abc" — найдено на позиции 0
       Заменяем: "abc" → "xbc"
       
Шаг 2: Ищем 'a' в "xbc" — не найдено
       Ищем 'b' в "xbc" — найдено на позиции 1
       Заменяем: "xbc" → "xyc"
       
Шаг 3: Ищем 'a' в "xyc" — не найдено
       Ищем 'b' в "xyc" — не найдено
       Ищем 'c' в "xyc" — найдено на позиции 2
       Заменяем: "xyc" → "xyz"
       
Шаг 4: Нет применимых правил — СТОП

Результат: "xyz"
```

---

## Сравнение моделей вычислений

| Свойство | Машина Тьюринга | Алгоритм Маркова |
|----------|-----------------|------------------|
| Память | Бесконечная лента | Строка |
| Операции | Чтение/запись, движение | Подстановка |
| Управление | Состояния + правила | Упорядоченные правила |
| Позиция | Головка на ленте | Первое вхождение |
| Полнота | Тьюринг-полная | Тьюринг-полная |

---

## Автор
**Проект выполнил:** Юсфи Абделькадер

**Преподаватель:** Михальченко Александра Викторовна

**Университет:** СПбГЭТУ «ЛЭТИ»
