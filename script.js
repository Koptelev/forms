document.getElementById('surveyForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData(this);
    const data = {};
    
    formData.forEach((value, key) => {
        if (key.endsWith('[]')) {
            const cleanKey = key.slice(0, -2);
            if (!data[cleanKey]) data[cleanKey] = [];
            data[cleanKey].push(value);
        } else {
            data[key] = value;
        }
    });

    // Обработка "Другое" для всех вопросов
    const otherFields = [
        { checkbox: 'sales_channels', input: 'sales_channels_other' },
        { checkbox: 'tools', input: 'tools_other' },
        { checkbox: 'risks', input: 'risks_other' }
    ];

    otherFields.forEach(field => {
        const otherInput = document.querySelector(`input[name="${field.input}"]`);
        if (otherInput && otherInput.value && data[field.checkbox] && data[field.checkbox].includes('Другое')) {
            data[field.checkbox] = data[field.checkbox].filter(v => v !== 'Другое');
            data[field.checkbox].push(otherInput.value);
        }
    });

    console.log(data);
    localStorage.setItem('surveyData', JSON.stringify(data));
    
    fetch('https://example.com/api/submit', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }).catch(() => console.log('Сервер недоступен, данные сохранены локально'));

    // Показываем модальное окно с кнопкой для скачивания Excel
    const modal = document.getElementById('successModal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <h3>Успех!</h3>
        <p>Форма успешно отправлена.</p>
        <button onclick="generateExcel()">Скачать Excel</button>
        <button onclick="document.getElementById('successModal').style.display='none'">Закрыть</button>
    `;
    modal.style.display = 'flex';
    this.reset();
});

// Функция для обновления опций во втором вопросе
function updateSecondQuestionOptions() {
    // Получаем все выбранные каналы продаж
    const selectedChannels = Array.from(document.querySelectorAll('input[name="sales_channels[]"]:checked'))
        .map(checkbox => checkbox.value);

    // Скрываем все подопции во втором вопросе
    document.querySelectorAll('.sub-options').forEach(option => {
        option.style.display = 'none';
    });

    // Скрываем текстовое поле для "Другое" во втором вопросе
    const otherImprovementInput = document.getElementById('improve_other_input');
    if (otherImprovementInput) {
        otherImprovementInput.style.display = 'none';
    }

    // Показываем подопции для каждого выбранного канала
    selectedChannels.forEach(channel => {
        switch(channel) {
            case 'Реклама':
                document.querySelector('.sub-options.advertising').style.display = 'block';
                break;
            case 'Звонки':
                document.querySelector('.sub-options.calls').style.display = 'block';
                break;
            case 'Рассылки':
                document.querySelector('.sub-options.emails').style.display = 'block';
                break;
            case 'Другое':
                // Показываем текстовое поле для "Другое" во втором вопросе
                if (otherImprovementInput) {
                    otherImprovementInput.style.display = 'block';
                }
                break;
        }
    });

    // Всегда показываем опцию "Другое"
    document.querySelector('input[name="improve_channels[]"][value="Другое"]')
        .closest('.checkbox-container').style.display = 'flex';
}

// Добавляем слушатели событий для всех чекбоксов первого вопроса
document.querySelectorAll('input[name="sales_channels[]"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateSecondQuestionOptions);
});

// Инициализируем состояние при загрузке страницы
document.addEventListener('DOMContentLoaded', updateSecondQuestionOptions);

document.addEventListener('DOMContentLoaded', function() {
    // Обработка поля "Другое" для инструментов
    const toolsOtherCheckbox = document.getElementById('tools_other');
    const toolsOtherInput = document.getElementById('tools_other_input');
    if (toolsOtherCheckbox && toolsOtherInput) {
        toolsOtherCheckbox.addEventListener('change', function() {
            toolsOtherInput.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Обработка поля "Другое" для рисков
    const risksOtherCheckbox = document.getElementById('risk_other');
    const risksOtherInput = document.getElementById('risk_other_input');
    if (risksOtherCheckbox && risksOtherInput) {
        risksOtherCheckbox.addEventListener('change', function() {
            risksOtherInput.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Инициализация состояния полей "Другое"
    if (toolsOtherInput) toolsOtherInput.style.display = 'none';
    if (risksOtherInput) risksOtherInput.style.display = 'none';
});

// Функция для генерации Excel файла
function generateExcel() {
    const companyData = JSON.parse(localStorage.getItem('surveyData') || '{}');
    
    // Создаем рабочую книгу
    const wb = XLSX.utils.book_new();
    
    // Подготавливаем данные для таблицы
    const data = [
        ['Форма предварительного опроса для Контур.Компас'],
        [''],
        ['Информация о компании'],
        ['Наименование организации:', companyData.company_name || 'Не указано'],
        [''],
        ['Ответы на вопросы:'],
        [''],
        ['Вопрос', 'Ответ'],
        ['Каналы продаж:', Array.isArray(companyData.sales_channels) ? companyData.sales_channels.join(', ') : companyData.sales_channels || 'Не указано'],
        ['Улучшения для рекламы:', Array.isArray(companyData.advertising_improvements) ? companyData.advertising_improvements.join(', ') : companyData.advertising_improvements || 'Не указано'],
        ['Улучшения для звонков:', Array.isArray(companyData.calls_improvements) ? companyData.calls_improvements.join(', ') : companyData.calls_improvements || 'Не указано'],
        ['Улучшения для рассылок:', Array.isArray(companyData.emails_improvements) ? companyData.emails_improvements.join(', ') : companyData.emails_improvements || 'Не указано'],
        ['Приоритетные задачи:', Array.isArray(companyData.priorities) ? companyData.priorities.join(', ') : companyData.priorities || 'Не указано'],
        ['Используемые инструменты:', Array.isArray(companyData.tools) ? companyData.tools.join(', ') : companyData.tools || 'Не указано'],
        ['Критерии выбора инструмента:', Array.isArray(companyData.criteria) ? companyData.criteria.join(', ') : companyData.criteria || 'Не указано'],
        ['Объем данных:', companyData.data_volume || 'Не указано'],
        ['Параметры анализа:', Array.isArray(companyData.analysis_params) ? companyData.analysis_params.join(', ') : companyData.analysis_params || 'Не указано'],
        ['Частота обновления данных:', companyData.update_frequency || 'Не указано'],
        ['Учитываемые риски:', Array.isArray(companyData.risks) ? companyData.risks.join(', ') : companyData.risks || 'Не указано'],
        ['Метрики успеха:', Array.isArray(companyData.success_metrics) ? companyData.success_metrics.join(', ') : companyData.success_metrics || 'Не указано'],
        ['Основные пользователи:', Array.isArray(companyData.users) ? companyData.users.join(', ') : companyData.users || 'Не указано'],
        ['Ожидаемая поддержка:', Array.isArray(companyData.support) ? companyData.support.join(', ') : companyData.support || 'Не указано']
    ];
    
    // Создаем лист с данными
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Устанавливаем ширину колонок
    ws['!cols'] = [{ wch: 40 }, { wch: 100 }];
    
    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(wb, ws, 'Опрос');
    
    // Сохраняем файл
    XLSX.writeFile(wb, 'Опрос_Контур.Компас.xlsx');
}

// Функция для переключения темы
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Проверяем сохраненную тему при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.querySelector('.theme-icon').textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        document.querySelector('.theme-icon').textContent = '🌙';
    }
    
    themeToggle.addEventListener('click', toggleTheme);
});