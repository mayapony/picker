import React, { useState } from 'react'
import './App.css'
import DateRangePicker, { type RangeType } from './components/DateRangePicker'

function App() {
  const [rangeType, setRangeType] = useState<RangeType>('day')
  const [range, setRange] = useState<[string, string] | null>(null)

  return (
    <div className="App">
      <h2>日期范围选择演示</h2>
      <div style={{ marginBottom: 12 }}>
        {(['day', 'week', 'month', 'quarter', 'year'] as RangeType[]).map(type => (
          <button
            key={type}
            style={{
              marginRight: 8,
              padding: '4px 10px',
              borderRadius: 4,
              border: rangeType === type ? '1px solid #1976d2' : '1px solid #ccc',
              background: rangeType === type ? '#e0f3ff' : '#fff',
              color: rangeType === type ? '#1976d2' : '#333',
              fontWeight: rangeType === type ? 600 : 400
            }}
            onClick={() => setRangeType(type)}
          >
            {type === 'day' && '日'}
            {type === 'week' && '周'}
            {type === 'month' && '月'}
            {type === 'quarter' && '季度'}
            {type === 'year' && '年'}
          </button>
        ))}
      </div>
      <DateRangePicker
        rangeType={rangeType}
        onChange={setRange}
      />
      <div style={{ marginTop: 16, fontSize: 15 }}>
        <b>当前选择：</b>
        {range ? `${range[0]} 至 ${range[1]}` : '未选择'}
      </div>
    </div>
  )
}

export default App
