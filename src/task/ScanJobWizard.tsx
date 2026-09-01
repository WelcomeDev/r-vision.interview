import { Alert, Stepper } from '../components';
import { STEPS } from './formModel';

/**
 * ЗАДАЧА КАНДИДАТА.
 *
 * Мастер создания задачи на сканирование: 4 шага, валидация на каждом шаге,
 * данные не теряются при переходах назад/вперёд, на последнем шаге — отправка
 * на «бэкенд» (api.createScanJob), который может вернуть 422 с ошибками по полям.
 *
 * Полное описание — в TASK.md.
 *
 * Готовые компоненты: ../components (TextField, SelectField, MultiSelectField — Field + контрол;
 * отдельные Field, TextInput, Select, MultiSelect; DataTable, TableCellInput, Stepper,
 * Checkbox, Button, Alert).
 * Данные: ../api — хуки RTK Query (useGetScanTypesQuery, useGetAssetsQuery,
 * useLazyCheckJobNameQuery, useCreateScanJobMutation и т.д.), store уже подключён.
 * Модель формы и список шагов: ./formModel.
 *
 * Библиотеки уже стоят: react-hook-form + yup + @hookform/resolvers + @reduxjs/toolkit.
 * Можно и без них — на useState, если так удобнее. Главное — объяснить выбор.
 */
export function ScanJobWizard() {
  return (
    <div className="stack">
      <Stepper steps={STEPS} current={0} />

      <div className="panel">
        <Alert variant="info" title="Начните отсюда">
          Отрендерьте шаг 1 и реализуйте переход «Далее» с валидацией. Компоненты и мок-API уже готовы —
          вкладка «Компоненты» показывает их API.
        </Alert>
      </div>
    </div>
  );
}
