/*
 * ЗАДАЧА 6: Решение типовых проблем типизации
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Исправьте все проблемы с типизацией
 * 3. Используйте type guards, utility types и другие продвинутые возможности
 * 4. Добавьте proper обработку ошибок и edge cases
 */

// Проблемные функции, которые нужно исправить

// ПРОБЛЕМА 1: Функция с any типом
function processData(data: unknown) {
    if (Array.isArray(data)) {
        return data.map(item => item.toString());
    }
    
    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).map(key => {
            const value = (data as Record<string, unknown>)[key];
            return `${key}: ${value != null ? String(value) : 'null'}`;
        });
    }
    
    return [String(data)];
}

// ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
function getValue<T>(obj: unknown, path: string): T | undefined {
    if (obj == null || typeof obj !== 'object') {
        return undefined;
    }
    
    const keys = path.split('.');
    let current: unknown = obj;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in (current as object)) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }
    
    return current as T;
}

// ПРОБЛЕМА 3: Функция с проблемами null/undefined
interface User {
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
    age?: number | null;
    avatar?: string | null;
}

interface FormattedUser {
    fullName: string;
    email: string;
    age: string | number;
    avatar: string;
}

function formatUser(user: User | null | undefined): FormattedUser {
    if (!user) {
        throw new Error('User is required');
    }
    
    const firstName = user.firstName ?? '';
    const lastName = user.lastName ?? '';
    
    return {
        fullName: `${firstName} ${lastName}`.trim() || 'Не указано',
        email: user.email?.toLowerCase() || 'Не указан',
        age: user.age ?? 'Не указан',
        avatar: user.avatar || '/default-avatar.png'
    };
}

// ПРОБЛЕМА 4: Функция с union типами без type guards
interface SuccessResponse<T> {
    success: true;
    data: T;
}

interface ErrorResponse {
    success: false;
    error: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function handleResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
        console.log('Данные:', response.data);
        return response.data;
    } else {
        console.error('Ошибка:', response.error);
        throw new Error(response.error);
    }
}

// ПРОБЛЕМА 5: Функция с проблемами мутации
function updateArray<T>(arr: readonly T[], index: number, newValue: T) {
    if (index < 0 || index >= arr.length) return [...arr];
    return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

// ПРОБЛЕМА 6: Класс с неправильной типизацией событий
type EventMap = Record<string, (...args: any[]) => void>;

class EventEmitter<T extends EventMap = EventMap> {
    private listeners: { [K in keyof T]?: T[K][] } = {};
    
    on<K extends keyof T>(event: K, callback: T[K]): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(callback);
    }
    
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
        const callbacks = this.listeners[event];
        if (callbacks) {
            callbacks.forEach(callback => callback(...args));
        }
    }
    
    off<K extends keyof T>(event: K, callback: T[K]): void {
        const callbacks = this.listeners[event];
        if (callbacks) {
            this.listeners[event] = callbacks.filter(cb => cb !== callback);
        }
    }
}

// ПРОБЛЕМА 7: Функция с проблемами асинхронности
async function fetchWithRetry(url: string, maxRetries: number = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    throw lastError;
}

// ПРОБЛЕМА 8: Функция валидации с проблемами типов
interface ValidationRule {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    message?: string;
}

interface FormData {
    [key: string]: string | undefined;
}

function validateForm(formData: FormData, rules: Record<string, ValidationRule>) {
    const errors: Record<string, string> = {};
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            errors[field] = rule.message || 'Поле обязательно для заполнения';
            continue;
        }
        if (value && typeof value === 'string' && rule.minLength && value.length < rule.minLength) {
            errors[field] = rule.message || `Минимальная длина: ${rule.minLength} символов`;
            continue;
        }
        if (value && typeof value === 'string' && rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.message || 'Неверный формат';
        }
    }
}

// ПРОБЛЕМА 9: Утилитарная функция с проблемами типов
function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) {
    const result: Pick<T, K> = {} as Pick<T, K>;
    keys.forEach(key => {
        result[key] = obj[key];
    });
    return result;
}

// ПРОБЛЕМА 10: Функция сравнения с проблемами типов
function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object' && a !== null && b !== null) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every(key => 
            isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
        );
    }
    
    return false;
}

// Примеры использования (должны работать после исправления типизации)
console.log('=== Тестирование processData ===');
console.log(processData([1, 2, 3]));
console.log(processData({ a: 1, b: 2 }));
console.log(processData('hello'));

console.log('\n=== Тестирование getValue ===');
const testObj = { user: { profile: { name: 'Анна' } } };
console.log(getValue(testObj, 'user.profile.name'));
console.log(getValue(testObj, 'user.nonexistent'));

console.log('\n=== Тестирование EventEmitter ===');
const emitter = new EventEmitter();
emitter.on('test', (message) => console.log('Получено:', message));
emitter.emit('test', 'Привет!');

console.log('\n=== Тестирование pick ===');
const user = { name: 'Анна', age: 25, email: 'anna@example.com', password: 'secret' };
const publicData = pick(user, ['name', 'age', 'email']);
console.log('Публичные данные:', publicData);