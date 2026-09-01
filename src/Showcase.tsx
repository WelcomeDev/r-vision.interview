import { useState } from 'react';

import { useGetAssetsQuery, useGetScanTypesQuery, useGetTagsQuery } from './api';
import {
  Alert,
  Button,
  Checkbox,
  Column,
  DataTable,
  Field,
  MultiSelectField,
  SelectField,
  Stepper,
  TableCellInput,
  TextField,
  TextInput,
} from './components';
import type { Asset } from './api';

/**
 * Витрина готовых компонентов: как они выглядят и какие пропсы принимают.
 * Компоненты «глупые» и полностью управляемые — с формой их связывает кандидат.
 */
export function Showcase() {
  const [name, setName] = useState('');
  const [scanType, setScanType] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [ports, setPorts] = useState<Record<string, string>>({});
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [defaultPorts, setDefaultPorts] = useState('');
  const [step, setStep] = useState(1);

  const scanTypes = useGetScanTypesQuery();
  const tagOptions = useGetTagsQuery();
  const assets = useGetAssetsQuery({});

  const columns: Column<Asset>[] = [
    { key: 'hostname', title: 'Хост', render: (row) => row.hostname, sortValue: (row) => row.hostname },
    { key: 'ip', title: 'IP', render: (row) => <span className="mono">{row.ip}</span>, sortValue: (row) => row.ip },
    { key: 'os', title: 'ОС', render: (row) => row.os },
    { key: 'group', title: 'Группа', render: (row) => <span className="tag-badge">{row.groupName}</span> },
    {
      key: 'criticality',
      title: 'Критичность',
      render: (row) => row.criticality,
      sortValue: (row) => ['low', 'medium', 'high', 'critical'].indexOf(row.criticality),
    },
    {
      key: 'ports',
      title: 'Порты',
      width: 200,
      render: (row) =>
        selectedAssets.includes(row.id) ? (
          <TableCellInput
            value={ports[row.id] ?? ''}
            onChange={(value) => setPorts((prev) => ({ ...prev, [row.id]: value }))}
            placeholder="22,80,443"
            error={/[^\d,\- ]/.test(ports[row.id] ?? '') ? 'Только цифры, запятые и дефис' : undefined}
            aria-label={`Порты для ${row.hostname}`}
          />
        ) : (
          <span className="muted">—</span>
        ),
    },
  ];

  return (
    <div className="stack">
      <Alert variant="info" title="Витрина компонентов">
        Все контролы управляемые: <code>value</code> + <code>onChange</code>, плюс <code>invalid</code> для подсветки
        ошибки. Готовые пары <code>TextField</code> / <code>SelectField</code> / <code>MultiSelectField</code> — это
        уже собранные Field + контрол. Данные здесь
        приходят из хуков RTK Query — <code>useGetScanTypesQuery</code>, <code>useGetTagsQuery</code>,{' '}
        <code>useGetAssetsQuery</code>.
      </Alert>

      <div className="panel">
        <h3 className="panel__title">Stepper</h3>
        <Stepper
          steps={[
            { id: 'general', title: 'Основное' },
            { id: 'scope', title: 'Область сканирования', description: 'активы' },
          ]}
          current={step}
          completed={[0]}
          invalid={[1]}
          isStepEnabled={() => true}
          onStepClick={setStep}
        />
      </div>

      <div className="panel">
        <h3 className="panel__title">Поля ввода</h3>
        <div className="row">
          <TextField
            label="Название задачи"
            required
            hint="От 3 до 60 символов"
            error={name.length > 0 && name.length < 3 ? 'Слишком короткое название' : undefined}
            value={name}
            onChange={setName}
            clearable
            placeholder="Например, Nightly DMZ scan"
          />

          <SelectField
            label="Тип сканирования"
            required
            options={scanTypes.data ?? []}
            loading={scanTypes.isLoading}
            value={scanType}
            onChange={setScanType}
            clearable
            searchable
          />

          <MultiSelectField
            label="Теги"
            hint="Мультиселект с поиском и чипами"
            error={tags.length > 5 ? 'Не больше пяти тегов' : undefined}
            options={tagOptions.data ?? []}
            loading={tagOptions.isLoading}
            value={tags}
            onChange={setTags}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <Checkbox checked={onlyCritical} onChange={setOnlyCritical} label="Учитывать только активы с агентом" />
        </div>
      </div>

      <div className="panel">
        <h3 className="panel__title">Ручная сборка: Field + контрол</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          <code>TextField</code>, <code>SelectField</code> и <code>MultiSelectField</code> — это Field плюс контрол.
          Когда нужна своя разметка, те же кирпичики собираются вручную:
        </p>
        <div className="row">
          <Field label="Порты по умолчанию" hint="Field отдаёт id и aria-атрибуты через render-prop">
            {(fieldProps) => (
              <TextInput {...fieldProps} value={defaultPorts} onChange={setDefaultPorts} placeholder="22,80,443" />
            )}
          </Field>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel__title">Таблица с выбором строк и редактированием ячейки</h3>
        <DataTable
          rows={assets.data ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          loading={assets.isLoading}
          selectedKeys={selectedAssets}
          onSelectionChange={setSelectedAssets}
          isRowInvalid={(row) => selectedAssets.includes(row.id) && /[^\d,\- ]/.test(ports[row.id] ?? '')}
          emptyText="Активы не найдены"
          toolbar={
            <>
              <span className="muted">Выбрано: {selectedAssets.length}</span>
              <span className="table__toolbar-spacer" />
              <Button size="sm" variant="ghost" onClick={() => setSelectedAssets([])}>
                Сбросить выбор
              </Button>
            </>
          }
        />
      </div>

      <div className="panel">
        <h3 className="panel__title">Кнопки и статусы</h3>
        <div className="row">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="primary">Далее</Button>
            <Button>Назад</Button>
            <Button variant="primary" loading>
              Сохранение
            </Button>
            <Button variant="ghost">Отмена</Button>
            <Button variant="danger">Удалить</Button>
          </div>
        </div>
        <div className="stack" style={{ marginTop: 16 }}>
          <Alert variant="error" title="Ошибка сохранения">
            Задача с таким именем уже существует
          </Alert>
          <Alert variant="success">Задача создана: job-1234</Alert>
        </div>
      </div>
    </div>
  );
}
