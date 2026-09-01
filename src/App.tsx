import { useState } from 'react';

import { Button } from './components';
import { Showcase } from './Showcase';
import { ScanJobWizard } from './task/ScanJobWizard';

export function App() {
  const [tab, setTab] = useState<'task' | 'showcase'>('task');

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
      </div>

      {tab === 'task' ? <ScanJobWizard /> : <Showcase />}
    </div>
  );
}
