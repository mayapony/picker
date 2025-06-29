import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import './DateRangePicker.scss';

// 扩展 dayjs 插件
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

export type RangeType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DateRangePickerProps {
  rangeType?: RangeType;
  onChange?: (range: [string, string]) => void;
  className?: string;
}

const getYears = (centerYear: number, range = 5) => {
  return Array.from({ length: range * 2 + 1 }, (_, i) => centerYear - range + i);
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  rangeType = 'day',
  onChange,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedRange, setSelectedRange] = useState<[string, string] | null>(null);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  // 格式化日期范围
  const formatRange = (start: dayjs.Dayjs, end: dayjs.Dayjs): [string, string] => {
    switch (rangeType) {
      case 'day':
        return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')];
      case 'week':
        return [`${start.year()}-W${start.week()}`, `${end.year()}-W${end.week()}`];
      case 'month':
        return [start.format('YYYY-MM'), end.format('YYYY-MM')];
      case 'quarter':
        return [`${start.year()}-Q${start.quarter()}`, `${end.year()}-Q${end.quarter()}`];
      case 'year':
        return [start.format('YYYY'), end.format('YYYY')];
      default:
        return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')];
    }
  };

  // 获取范围开始日期
  const getRangeStart = (date: dayjs.Dayjs): dayjs.Dayjs => {
    switch (rangeType) {
      case 'day':
        return date.startOf('day');
      case 'week':
        return date.startOf('week');
      case 'month':
        return date.startOf('month');
      case 'quarter':
        return date.startOf('quarter');
      case 'year':
        return date.startOf('year');
      default:
        return date.startOf('day');
    }
  };

  // 获取范围结束日期
  const getRangeEnd = (date: dayjs.Dayjs): dayjs.Dayjs => {
    switch (rangeType) {
      case 'day':
        return date.endOf('day');
      case 'week':
        return date.endOf('week');
      case 'month':
        return date.endOf('month');
      case 'quarter':
        return date.endOf('quarter');
      case 'year':
        return date.endOf('year');
      default:
        return date.endOf('day');
    }
  };

  // 处理按钮型选择（如月、季度、年）
  const handleButtonSelect = (date: dayjs.Dayjs) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date.isBefore(startDate)) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  useEffect(() => {
    if (startDate && endDate && onChange) {
      const range = formatRange(startDate, endDate);
      setSelectedRange(range);
      onChange(range);
    }
  }, [startDate, endDate, onChange, rangeType]);

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedRange(null);
  };

  // 渲染日历网格
  const renderCalendarGrid = () => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startOfCalendar = startOfMonth.startOf('week');
    const endOfCalendar = endOfMonth.endOf('week');
    
    const days = [];
    let currentDay = startOfCalendar;

    while (currentDay.isBefore(endOfCalendar) || currentDay.isSame(endOfCalendar, 'day')) {
      const isCurrentMonth = currentDay.month() === currentDate.month();
      const isSelected = startDate && endDate && 
        currentDay.isBetween(startDate, endDate, 'day', '[]');
      const isStart = startDate && currentDay.isSame(startDate, 'day');
      const isEnd = endDate && currentDay.isSame(endDate, 'day');

      days.push(
        <div
          key={currentDay.format('YYYY-MM-DD')}
          className={`date-range-picker__day ${
            !isCurrentMonth ? 'date-range-picker__day--other-month' : ''
          } ${
            isSelected ? 'date-range-picker__day--selected' : ''
          } ${
            isStart ? 'date-range-picker__day--start' : ''
          } ${
            isEnd ? 'date-range-picker__day--end' : ''
          }`}
          onClick={() => handleButtonSelect(currentDay)}
        >
          {currentDay.date()}
        </div>
      );

      currentDay = currentDay.add(1, 'day');
    }

    return days;
  };

  // 渲染月选择
  const renderMonthGrid = () => {
    const months = Array.from({ length: 12 }, (_, i) => currentDate.month(i));
    return (
      <div className="date-range-picker__month-grid">
        {months.map(month => {
          const isSelected = startDate && endDate && month.isBetween(startDate, endDate, 'month', '[]');
          const isStart = startDate && month.isSame(startDate, 'month');
          const isEnd = endDate && month.isSame(endDate, 'month');
          return (
            <button
              key={month.format('YYYY-MM')}
              className={`date-range-picker__month-btn ${isSelected ? 'selected' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
              onClick={() => handleButtonSelect(month)}
            >
              {month.format('M')}月
            </button>
          );
        })}
      </div>
    );
  };

  // 渲染季度选择
  const renderQuarterGrid = () => {
    const quarters = [1, 2, 3, 4].map(q => currentDate.quarter(q));
    return (
      <div className="date-range-picker__quarter-grid">
        {quarters.map(q => {
          const qStart = q.startOf('quarter');
          const qEnd = q.endOf('quarter');
          const isSelected = startDate && endDate && (
            (qStart.isAfter(startDate, 'day') || qStart.isSame(startDate, 'day')) &&
            (qEnd.isBefore(endDate, 'day') || qEnd.isSame(endDate, 'day'))
          );
          const isStart = startDate && qStart.isSame(startDate, 'quarter');
          const isEnd = endDate && qEnd.isSame(endDate, 'quarter');
          return (
            <button
              key={q.format('YYYY-Q')}
              className={`date-range-picker__quarter-btn ${isSelected ? 'selected' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
              onClick={() => handleButtonSelect(q)}
            >
              {q.format('Q[季度]')}
            </button>
          );
        })}
      </div>
    );
  };

  // 渲染年选择
  const renderYearGrid = () => {
    const years = getYears(currentDate.year(), 5);
    return (
      <div className="date-range-picker__year-grid">
        {years.map(y => {
          const yDate = currentDate.year(y).startOf('year');
          const isSelected = startDate && endDate && yDate.isBetween(startDate, endDate, 'year', '[]');
          const isStart = startDate && yDate.isSame(startDate, 'year');
          const isEnd = endDate && yDate.isSame(endDate, 'year');
          return (
            <button
              key={y}
              className={`date-range-picker__year-btn ${isSelected ? 'selected' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
              onClick={() => handleButtonSelect(yDate)}
            >
              {y}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`date-range-picker ${className}`}>
      <div className="date-range-picker__header">
        <button 
          className="date-range-picker__nav-btn" 
          onClick={() => setCurrentDate(currentDate.subtract(1, 
            rangeType === 'year' ? 'year' : 
            rangeType === 'month' || rangeType === 'quarter' ? 'year' : 'month'
          ))}
        >
          ‹
        </button>
        <div className="date-range-picker__title">
          {rangeType === 'year' ? `${currentDate.year()}年` : 
           rangeType === 'month' || rangeType === 'quarter' ? `${currentDate.year()}年` :
           `${currentDate.format('YYYY年MM月')}`}
        </div>
        <button 
          className="date-range-picker__nav-btn" 
          onClick={() => setCurrentDate(currentDate.add(1, 
            rangeType === 'year' ? 'year' : 
            rangeType === 'month' || rangeType === 'quarter' ? 'year' : 'month'
          ))}
        >
          ›
        </button>
      </div>
      {rangeType === 'day' || rangeType === 'week' ? (
        <>
          <div className="date-range-picker__weekdays">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="date-range-picker__weekday">{day}</div>
            ))}
          </div>
          <div className="date-range-picker__calendar">{renderCalendarGrid()}</div>
        </>
      ) : null}
      {rangeType === 'month' && renderMonthGrid()}
      {rangeType === 'quarter' && renderQuarterGrid()}
      {rangeType === 'year' && renderYearGrid()}
      <div className="date-range-picker__actions">
        <button className="date-range-picker__action-btn date-range-picker__action-btn--reset" onClick={handleReset}>重置</button>
        {selectedRange && (
          <div className="date-range-picker__selected-range">
            已选择: {selectedRange[0]} 至 {selectedRange[1]}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker; 