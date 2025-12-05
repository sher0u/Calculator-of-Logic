# Математическая логика и теория алгоритмов
## Калькулятор логических функций и вычислительных моделей

**Проект выполнил:** Юсфи Абделькадер  
**Преподаватель:** Михальченко Александра Викторовна  
**Университет:** СПбГЭТУ «ЛЭТИ»

---

## Содержание

1. [Таблицы истинности](#1-таблицы-истинности)
2. [ДНФ (Дизъюнктивная нормальная форма)](#2-днф-дизъюнктивная-нормальная-форма)
3. [СКНФ (Совершенная конъюнктивная нормальная форма)](#3-скнф-совершенная-конъюнктивная-нормальная-форма)
4. [Карты Карно](#4-карты-карно)
5. [Полином Жегалкина](#5-полином-жегалкина)
6. [Машина Тьюринга](#6-машина-тьюринга)
7. [Алгоритм Маркова](#7-алгоритм-маркова)

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

| A | B | f |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 | ← A'∧B |
| 1 | 0 | 1 | ← A∧B' |
| 1 | 1 | 0 |

**ДНФ:** (A'∧B) ∨ (A∧B')

### Исходный код:

```javascript
function calculateDNF() {
    const vectorInput = document.getElementById('dnf-function').value.trim();
    
    const bits = vectorInput.split('').map(bit => parseInt(bit));
    const variableCount = Math.log2(bits.length);
    
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
            clauses.push('(' + terms.join('∨') + ')');
        }
    }
    
    const expression = clauses.length > 0 ? clauses.join(' ∧ ') : '1';
    return expression;
}
```

---

## 4. Карты Карно

### Что это?
Карта Карно — это графический метод минимизации логических функций. Позволяет найти МДНФ и МКНФ.

### Алгоритм минимизации:
1. Строим таблицу с кодом Грея (соседние ячейки отличаются на 1 бит)
2. Заполняем значениями функции
3. Группируем соседние единицы (для МДНФ) или нули (для МКНФ)
4. Размер группы должен быть степенью 2: 1, 2, 4, 8...
5. Группы могут "заворачиваться" через края
6. Чем больше группа, тем проще терм

### Пример для 3 переменных:
**Вектор:** 00010111

```
      BC
      00  01  11  10
A  0 | 0 | 0 | 1 | 0 |
   1 | 0 | 1 | 1 | 1 |
```

**МДНФ:** B∧C ∨ A∧C ∨ A∧B

### Исходный код:

```javascript
// Построение карты Карно
function buildKarnaughMap() {
    const vectorInput = document.getElementById('karnaugh-function').value.trim();
    const variablesCount = parseInt(document.getElementById('karnaugh-vars').value);
    
    const bits = vectorInput.split('').map(bit => parseInt(bit));
    const variables = getVariableNames(variablesCount);
    
    // Создаём карту и индексы (код Грея)
    let map, indexMap;
    
    switch (variablesCount) {
        case 2:
            map = [[bits[0], bits[1]], [bits[2], bits[3]]];
            indexMap = [[0, 1], [2, 3]];
            break;
        case 3:
            // Код Грея: 00, 01, 11, 10
            map = [[bits[0], bits[1], bits[3], bits[2]], 
                   [bits[4], bits[5], bits[7], bits[6]]];
            indexMap = [[0, 1, 3, 2], [4, 5, 7, 6]];
            break;
        case 4:
            map = [
                [bits[0], bits[1], bits[3], bits[2]],
                [bits[4], bits[5], bits[7], bits[6]],
                [bits[12], bits[13], bits[15], bits[14]],
                [bits[8], bits[9], bits[11], bits[10]]
            ];
            indexMap = [
                [0, 1, 3, 2],
                [4, 5, 7, 6],
                [12, 13, 15, 14],
                [8, 9, 11, 10]
            ];
            break;
    }
    
    // Минимизация
    const minDNF = minimizeKarnaughDNF(bits, variablesCount, map, indexMap, variables);
    const minCNF = minimizeKarnaughCNF(bits, variablesCount, map, indexMap, variables);
    
    return { map, minDNF, minCNF };
}

// Минимизация ДНФ (группировка единиц)
function minimizeKarnaughDNF(bits, variablesCount, map, indexMap, variables) {
    const rows = map.length;
    const cols = map[0].length;
    const used = Array(rows).fill(null).map(() => Array(cols).fill(false));
    const groups = [];
    const steps = [];
    
    // Шаг 1: Находим все единицы
    const ones = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (map[i][j] === 1) {
                ones.push({row: i, col: j, index: indexMap[i][j]});
            }
        }
    }
    
    if (ones.length === 0) {
        return { expression: '0', groups: [], steps: ['Нет единиц - функция равна 0'] };
    }
    
    if (ones.length === rows * cols) {
        return { expression: '1', groups: [], steps: ['Все ячейки = 1 - функция равна 1'] };
    }
    
    steps.push(`Найдены единицы в позициях: ${ones.map(o => o.index).join(', ')}`);
    
    // Шаг 2: Ищем группы от больших к маленьким
    const groupSizes = variablesCount === 2 ? [4, 2, 1] : 
                      variablesCount === 3 ? [8, 4, 2, 1] : [16, 8, 4, 2, 1];
    
    for (const size of groupSizes) {
        const possibleGroups = findGroupsOfSize(map, rows, cols, size, 1);
        
        for (const group of possibleGroups) {
            // Проверяем, покрывает ли группа новые единицы
            let coversNew = false;
            for (const cell of group.cells) {
                if (!used[cell.row][cell.col] && map[cell.row][cell.col] === 1) {
                    coversNew = true;
                    break;
                }
            }
            
            // Все ячейки группы должны быть единицами
            if (coversNew && group.cells.every(c => map[c.row][c.col] === 1)) {
                groups.push(group);
                for (const cell of group.cells) {
                    used[cell.row][cell.col] = true;
                }
                const term = getTermFromGroup(group, variablesCount, variables, indexMap);
                steps.push(`Группа размера ${size}: [${group.cells.map(c => indexMap[c.row][c.col]).join(', ')}] → ${term}`);
            }
        }
    }
    
    // Шаг 3: Формируем выражение
    const terms = groups.map(g => getTermFromGroup(g, variablesCount, variables, indexMap));
    const expression = terms.join(' ∨ ');
    
    steps.push(`МДНФ: ${expression}`);
    
    return { expression, groups, steps };
}

// Минимизация КНФ (группировка нулей)
function minimizeKarnaughCNF(bits, variablesCount, map, indexMap, variables) {
    const rows = map.length;
    const cols = map[0].length;
    const used = Array(rows).fill(null).map(() => Array(cols).fill(false));
    const groups = [];
    const steps = [];
    
    // Находим все нули
    const zeros = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (map[i][j] === 0) {
                zeros.push({row: i, col: j, index: indexMap[i][j]});
            }
        }
    }
    
    if (zeros.length === 0) {
        return { expression: '1', groups: [], steps: ['Нет нулей - функция равна 1'] };
    }
    
    steps.push(`Найдены нули в позициях: ${zeros.map(o => o.index).join(', ')}`);
    
    // Ищем группы нулей
    const groupSizes = variablesCount === 2 ? [4, 2, 1] : 
                      variablesCount === 3 ? [8, 4, 2, 1] : [16, 8, 4, 2, 1];
    
    for (const size of groupSizes) {
        const possibleGroups = findGroupsOfSize(map, rows, cols, size, 0);
        
        for (const group of possibleGroups) {
            let coversNew = false;
            for (const cell of group.cells) {
                if (!used[cell.row][cell.col] && map[cell.row][cell.col] === 0) {
                    coversNew = true;
                    break;
                }
            }
            
            if (coversNew && group.cells.every(c => map[c.row][c.col] === 0)) {
                groups.push(group);
                for (const cell of group.cells) {
                    used[cell.row][cell.col] = true;
                }
                const term = getTermFromGroupCNF(group, variablesCount, variables, indexMap);
                steps.push(`Группа нулей размера ${size}: [${group.cells.map(c => indexMap[c.row][c.col]).join(', ')}] → (${term})`);
            }
        }
    }
    
    const terms = groups.map(g => '(' + getTermFromGroupCNF(g, variablesCount, variables, indexMap) + ')');
    const expression = terms.join(' ∧ ');
    
    steps.push(`МКНФ: ${expression}`);
    
    return { expression, groups, steps };
}

// Поиск всех возможных групп заданного размера
function findGroupsOfSize(map, rows, cols, size, targetValue) {
    const groups = [];
    
    // Возможные размеры прямоугольников
    const dimensions = [];
    if (size === 1) dimensions.push([1, 1]);
    else if (size === 2) dimensions.push([1, 2], [2, 1]);
    else if (size === 4) dimensions.push([1, 4], [4, 1], [2, 2]);
    else if (size === 8) dimensions.push([2, 4], [4, 2]);
    else if (size === 16) dimensions.push([4, 4]);
    
    for (const [h, w] of dimensions) {
        if (h > rows || w > cols) continue;
        
        for (let startRow = 0; startRow < rows; startRow++) {
            for (let startCol = 0; startCol < cols; startCol++) {
                const cells = [];
                let valid = true;
                
                for (let di = 0; di < h && valid; di++) {
                    for (let dj = 0; dj < w && valid; dj++) {
                        // Используем модуль для "заворачивания" через края
                        const r = (startRow + di) % rows;
                        const c = (startCol + dj) % cols;
                        
                        if (map[r][c] !== targetValue) {
                            valid = false;
                        } else {
                            cells.push({row: r, col: c});
                        }
                    }
                }
                
                if (valid && cells.length === size) {
                    groups.push({cells, size, height: h, width: w});
                }
            }
        }
    }
    
    return groups;
}

// Получение терма ДНФ из группы
function getTermFromGroup(group, variablesCount, variables, indexMap) {
    if (group.cells.length === 0) return '1';
    
    const indices = group.cells.map(c => indexMap[c.row][c.col]);
    const binaries = indices.map(i => i.toString(2).padStart(variablesCount, '0'));
    
    const termParts = [];
    for (let v = 0; v < variablesCount; v++) {
        const bits = binaries.map(b => b[v]);
        const allZero = bits.every(b => b === '0');
        const allOne = bits.every(b => b === '1');
        
        if (allZero) {
            termParts.push(variables[v] + "'"); // Отрицание
        } else if (allOne) {
            termParts.push(variables[v]); // Без отрицания
        }
        // Если биты разные — переменная не входит в терм (сокращается)
    }
    
    return termParts.length > 0 ? termParts.join('∧') : '1';
}

// Получение терма КНФ из группы (инвертированная логика)
function getTermFromGroupCNF(group, variablesCount, variables, indexMap) {
    if (group.cells.length === 0) return '0';
    
    const indices = group.cells.map(c => indexMap[c.row][c.col]);
    const binaries = indices.map(i => i.toString(2).padStart(variablesCount, '0'));
    
    const termParts = [];
    for (let v = 0; v < variablesCount; v++) {
        const bits = binaries.map(b => b[v]);
        const allZero = bits.every(b => b === '0');
        const allOne = bits.every(b => b === '1');
        
        // Для КНФ логика ОБРАТНАЯ
        if (allZero) {
            termParts.push(variables[v]); // Без отрицания
        } else if (allOne) {
            termParts.push(variables[v] + "'"); // С отрицанием
        }
    }
    
    return termParts.length > 0 ? termParts.join('∨') : '0';
}
```

### Визуализация с цветами групп:

```javascript
function displayKarnaughMap(map, variablesCount, variables, minDNF, minCNF) {
    // Цвета для разных групп
    const groupColors = [
        'rgba(255, 99, 132, 0.5)',   // красный
        'rgba(54, 162, 235, 0.5)',   // синий
        'rgba(255, 206, 86, 0.5)',   // жёлтый
        'rgba(75, 192, 192, 0.5)',   // бирюзовый
        'rgba(153, 102, 255, 0.5)',  // фиолетовый
        'rgba(255, 159, 64, 0.5)',   // оранжевый
    ];
    
    const rows = map.length;
    const cols = map[0].length;
    
    // Назначаем цвета ячейкам по группам
    const cellColors = Array(rows).fill(null).map(() => Array(cols).fill(''));
    
    minDNF.groups.forEach((group, idx) => {
        const color = groupColors[idx % groupColors.length];
        group.cells.forEach(cell => {
            cellColors[cell.row][cell.col] = color;
        });
    });
    
    // Строим HTML таблицу с цветами
    let html = '<table class="table table-bordered">';
    // ... генерация HTML с background: cellColors[i][j]
}
```

---

## 5. Полином Жегалкина

### Что это?
Полином Жегалкина — это представление логической функции через XOR (⊕) и AND (·).

**Общий вид:** f = a₀ ⊕ a₁·A ⊕ a₂·B ⊕ a₃·A·B ⊕ ...

---

### Метод 1: Треугольник Паскаля

#### Алгоритм:
1. Записываем вектор функции в первую строку
2. Каждый элемент следующей строки = XOR двух соседних сверху
3. Коэффициенты — первый столбец треугольника

#### Пример:
**Вектор:** 0110

```
Строка 0: 0  1  1  0    ← a₀ = 0
Строка 1:  1  0  1      ← a₁ = 1  
Строка 2:   1  1        ← a₂ = 1
Строка 3:    0          ← a₃ = 0
```

**Полином:** A ⊕ B

#### Исходный код:

```javascript
function calculateZhegalkinTriangle(bits, variableCount) {
    const triangle = [];
    let currentRow = [...bits];
    triangle.push([...currentRow]);
    
    // Строим треугольник
    while (currentRow.length > 1) {
        const nextRow = [];
        for (let i = 0; i < currentRow.length - 1; i++) {
            nextRow.push(currentRow[i] ^ currentRow[i + 1]); // XOR
        }
        triangle.push([...nextRow]);
        currentRow = nextRow;
    }
    
    // Коэффициенты — первый столбец
    const coefficients = triangle.map(row => row[0]);
    
    return { triangle, coefficients };
}
```

---

### Метод 2: Табличный метод

#### Алгоритм:
1. Строим таблицу со всеми термами: 1, A, B, AB, C, AC, BC, ABC...
2. Коэффициент aₛ = XOR всех f(x), где x ≥ S (поэлементно)

#### Формула:
**aₛ = ⊕ f(x) для всех x, где (x AND S) = S**

#### Исходный код:

```javascript
function calculateZhegalkinTable(bits, variableCount) {
    const n = bits.length;
    
    // Вычисляем коэффициенты
    const coefficients = [];
    for (let S = 0; S < n; S++) {
        let coef = 0;
        for (let x = 0; x < n; x++) {
            // x >= S означает: все единичные биты S есть в x
            if ((x & S) === S) {
                coef ^= bits[x];
            }
        }
        coefficients.push(coef);
    }
    
    return coefficients;
}

// Построение строки полинома
function buildPolynomialString(coefficients, variableCount) {
    const variables = getVariableNames(variableCount);
    const terms = [];
    
    coefficients.forEach((coef, index) => {
        if (coef === 1) {
            if (index === 0) {
                terms.push('1');
            } else {
                const binary = index.toString(2).padStart(variableCount, '0');
                const termVars = [];
                for (let i = 0; i < binary.length; i++) {
                    if (binary[i] === '1') termVars.push(variables[i]);
                }
                terms.push(termVars.join('·'));
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
- **Лента** — бесконечная последовательность ячеек
- **Головка** — читает/пишет, двигается влево/вправо
- **Состояния** — внутреннее состояние машины
- **Правила** — определяют поведение

### Формат правила:
```
состояние, читаемый_символ, записываемый_символ, направление, новое_состояние
```

**Направления:** R (вправо), L (влево), N (на месте)  
**Специальные символы:** B (пустой), qf (финальное состояние)

### Пример: Инкремент (111 → 1111)

**Правила:**
```
q0,1,1,R,q0
q0,B,1,N,qf
```

**Выполнение:**
```
Шаг 0: [1] 1  1  B   состояние q0, читаем 1 → пишем 1, вправо
Шаг 1:  1 [1] 1  B   состояние q0, читаем 1 → пишем 1, вправо
Шаг 2:  1  1 [1] B   состояние q0, читаем 1 → пишем 1, вправо
Шаг 3:  1  1  1 [B]  состояние q0, читаем B → пишем 1, СТОП
Результат: 1111
```

### Исходный код:

```javascript
let turingMachine = {
    tape: [],
    headPosition: 0,
    currentState: 'q0',
    rules: new Map(),
    steps: 0,
    maxSteps: 1000
};

// Парсинг правил
function parseTuringRules(rulesText) {
    const rules = new Map();
    const lines = rulesText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length === 5) {
            const [currentState, currentSymbol, newSymbol, direction, newState] = parts;
            const key = `${currentState},${currentSymbol}`;
            rules.set(key, { newSymbol, direction, newState });
        }
    });
    
    return rules;
}

// Один шаг машины
function stepTuringOnce() {
    if (turingMachine.steps >= turingMachine.maxSteps) return false;
    if (['qf', 'qF', 'halt'].includes(turingMachine.currentState)) return false;
    
    const currentSymbol = turingMachine.tape[turingMachine.headPosition] || 'B';
    const key = `${turingMachine.currentState},${currentSymbol}`;
    const rule = turingMachine.rules.get(key);
    
    if (!rule) return false;
    
    // Применяем правило
    turingMachine.tape[turingMachine.headPosition] = rule.newSymbol;
    turingMachine.currentState = rule.newState;
    
    // Двигаем головку
    if (rule.direction === 'R') {
        turingMachine.headPosition++;
        if (turingMachine.headPosition >= turingMachine.tape.length) {
            turingMachine.tape.push('B');
        }
    } else if (rule.direction === 'L') {
        turingMachine.headPosition--;
        if (turingMachine.headPosition < 0) {
            turingMachine.tape.unshift('B');
            turingMachine.headPosition = 0;
        }
    }
    
    turingMachine.steps++;
    return !['qf', 'qF', 'halt'].includes(turingMachine.currentState);
}
```

---

## 7. Алгоритм Маркова

### Что это?
Алгоритм Маркова — система подстановок строк.

### Правила работы:
1. Правила применяются сверху вниз по приоритету
2. Заменяется только **первое** вхождение
3. После замены — возврат к первому правилу
4. Точка в начале (`.pattern -> replacement`) — завершающее правило

### Пример: abc → xyz

**Правила:**
```
a -> x
b -> y
c -> z
```

**Выполнение:**
```
Шаг 0: "abc"
Шаг 1: "xbc" (a → x)
Шаг 2: "xyc" (b → y)
Шаг 3: "xyz" (c → z)
СТОП: нет применимых правил
```

### Исходный код:

```javascript
let markovAlgorithm = {
    currentString: '',
    rules: [],
    steps: [],
    stepCount: 0,
    maxSteps: 100
};

// Парсинг правил
function parseMarkovRules(rulesText) {
    const rules = [];
    const lines = rulesText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        let parts;
        if (line.includes('->')) {
            parts = line.split('->').map(part => part.trim());
        } else if (line.includes('→')) {
            parts = line.split('→').map(part => part.trim());
        } else return;
        
        if (parts.length === 2) {
            let pattern = parts[0];
            let replacement = parts[1];
            let isFinal = false;
            
            // Завершающее правило (точка в начале)
            if (pattern.startsWith('.')) {
                isFinal = true;
                pattern = pattern.substring(1);
            }
            
            rules.push({ pattern, replacement, isFinal, original: line });
        }
    });
    
    return rules;
}

// Один шаг алгоритма
function stepMarkovOnce() {
    if (markovAlgorithm.stepCount >= markovAlgorithm.maxSteps) return false;
    
    for (const rule of markovAlgorithm.rules) {
        const index = markovAlgorithm.currentString.indexOf(rule.pattern);
        
        if (index !== -1) {
            // Заменяем первое вхождение
            markovAlgorithm.currentString = 
                markovAlgorithm.currentString.substring(0, index) + 
                rule.replacement + 
                markovAlgorithm.currentString.substring(index + rule.pattern.length);
            
            markovAlgorithm.stepCount++;
            markovAlgorithm.steps.push({
                step: markovAlgorithm.stepCount,
                string: markovAlgorithm.currentString,
                rule: rule.original
            });
            
            // Завершающее правило — СТОП
            if (rule.isFinal) return false;
            
            return true; // Возврат к первому правилу
        }
    }
    
    return false; // Нет применимых правил
}
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

Обе модели **эквивалентны** — всё, что можно вычислить на одной, можно вычислить на другой.

---

## Автор

**Проект выполнил:** Юсфи Абделькадер  
**Преподаватель:** Михальченко Александра Викторовна  
**Университет:** Санкт-Петербургский государственный электротехнический университет «ЛЭТИ» им. В.И. Ульянова (Ленина)
