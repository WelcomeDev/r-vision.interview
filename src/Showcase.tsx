import { useEffect, useState } from 'react';

import { api } from './api';
import {
  Alert,
  Button,
  Checkbox,
  Column,
  DataTable,
  Field,
  MultiSelect,
  Select,
  Stepper,
  TableCellInput,
  TextInput,
} from './components';
import type { Asset, Option } from './api';

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
  const [step, setStep] = useState(1);

  const [scanTypes, setScanTypes] = useState<Option[]>([]);
  const [tagOptions, setTagOptions] = useState<Option[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  useEffect(() => {
    api.getScanTypes().then(setScanTypes);
    api.getTags().then(setTagOptions);
    api.getAssets().then((rows) => {
      setAssets(rows);
      setAssetsLoading(false);
    });
  }, []);

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
        ошибки. Обёртка <code>Field</code> отвечает за label, hint, текст ошибки и aria-атрибуты.
      </Alert>

      <div className="panel">
        <h3 className="panel__title">Stepper</h3>
        <Stepper
          steps={[
            { id: 'general', title: 'Основное' },
            { id: 'scope', title: 'Область', description: 'активы' },
            { id: 'confirm', title: 'Подтверждение' },
          ]}
          current={step}
          completed={[0]}
          invalid={[2]}
          isStepEnabled={() => true}
          onStepClick={setStep}
        />
      </div>

      <div className="panel">
        <h3 className="panel__title">Поля ввода</h3>
        <div className="row">
          <Field
            label="Название задачи"
            required
            hint="От 3 до 60 символов"
            error={name.length > 0 && name.length < 3 ? 'Слишком короткое название' : undefined}
          >
            {(fieldProps) => (
              <TextInput
                {...fieldProps}
                value={name}
                onChange={setName}
                clearable
                placeholder="Например, Nightly DMZ scan"
                invalid={name.length > 0 && name.length < 3}
              />
            )}
          </Field>

          <Field label="Тип сканирования" required hint="Пентест требует согласования и выключен">
            {(fieldProps) => (
              <Select
                {...fieldProps}
                options={scanTypes}
                loading={scanTypes.length === 0}
                value={scanType}
                onChange={setScanType}
                clearable
                searchable
              />
            )}
          </Field>

          <Field label="Теги" hint="Мультиселект с поиском и чипами">
            {(fieldProps) => (
              <MultiSelect
                {...fieldProps}
                options={tagOptions}
                loading={tagOptions.length === 0}
                value={tags}
                onChange={setTags}
                invalid={tags.length > 5}
              />
            )}
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <Checkbox checked={onlyCritical} onChange={setOnlyCritical} label="Учитывать только активы с агентом" />
        </div>
      </div>

      <div className="panel">
        <h3 className="panel__title">Таблица с выбором строк и редактированием ячейки</h3>
        <DataTable
          rows={assets}
          columns={columns}
          rowKey={(row) => row.id}
          loading={assetsLoading}
          selectedKeys={selectedAssets}
          onSelectionChange={setSelectedAssets}
          isRowDisabled={(row) => !row.agentInstalled}
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
