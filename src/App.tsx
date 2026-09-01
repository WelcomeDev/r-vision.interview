import { lazy, Suspense, useState } from 'react';

import { Button, Spinner } from './components';
import { Showcase } from './Showcase';
import { ScanJobWizard } from './task/ScanJobWizard';

type Tab = 'task' | 'showcase' | 'solution';

// Вкладка с эталонным решением появляется, только если каталог solution/ есть локально.
// У кандидата его нет — glob вернёт пустой объект, и сборка не сломается.
const solutionEntry = Object.values(
  import.meta.glob<{ SolutionWizard: () => JSX.Element }>('../solution/SolutionWizard.tsx'),
)[0];

const SolutionWizard = solutionEntry
  ? lazy(() => solutionEntry().then((module) => ({ default: module.SolutionWizard })))
  : null;

export function App() {
  const [tab, setTab] = useState<Tab>('task');

  return (
    <div className="app">
      <h1 className="app__title">Мастер создания задачи на сканирование</h1>
      <p className="app__subtitle">Live-coding: многошаговая форма с валидацией</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Button variant={tab === 'task' ? 'primary' : 'secondary'} onClick={() => setTab('task')}>
          Задача
        </Button>
        <Button variant={tab === 'showcase' ? 'primary' : 'secondary'} onClick={() => setTab('showcase')}>
          Компоненты
        </Button>
        {SolutionWizard && (
          <Button variant={tab === 'solution' ? 'primary' : 'secondary'} onClick={() => setTab('solution')}>
            Решение
          </Button>
        )}
      </div>

      {tab === 'task' && <ScanJobWizard />}
      {tab === 'showcase' && <Showcase />}
      {tab === 'solution' && SolutionWizard && (
        <Suspense fallback={<Spinner />}>
          <SolutionWizard />
        </Suspense>
      )}
    </div>
  );
}
