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

  // 处理日期选择（日/周）
  const handleDateSelect = (date: dayjs.Dayjs) => {
    console.log('原始日期:', date.toString())
    console.log('格式化日期:', date.format('YYYY-MM-DD'))
    
    // 确保使用本地时间，不受时区影响
    const localDate = dayjs(date.format('YYYY-MM-DD'));
    console.log('本地日期:', localDate.toString())
    
    if (!startDate || (startDate && endDate)) {
      // 开始新的选择
      const rangeStart = rangeType === 'week' ? localDate.startOf('week') : localDate.startOf('day');
      setStartDate(rangeStart);
      setEndDate(null);
    } else {
      // 完成选择
      const rangeEnd = rangeType === 'week' ? localDate.endOf('week') : localDate.endOf('day');
      const rangeStart = startDate;
      
      // 确保开始日期在结束日期之前
      if (rangeStart.isAfter(rangeEnd)) {
        setStartDate(rangeEnd);
        setEndDate(rangeStart);
      } else {
        setEndDate(rangeEnd);
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
      
      // 根据 rangeType 判断选中状态
      let isSelected = false;
      let isStart = false;
      let isEnd = false;
      
      if (startDate) {
        if (rangeType === 'week') {
          // 周选择：判断当前日期是否在选中的周范围内
          const weekStart = currentDay.startOf('week');
          const weekEnd = currentDay.endOf('week');
          
          if (endDate) {
            // 有结束日期时，判断是否在范围内
            isSelected = weekStart.isSame(startDate, 'day') || weekEnd.isSame(endDate, 'day') ||
                        (weekStart.isAfter(startDate, 'day') && weekEnd.isBefore(endDate, 'day'));
            isStart = weekStart.isSame(startDate, 'day');
            isEnd = weekEnd.isSame(endDate, 'day');
          } else {
            // 只有开始日期时，高亮当前选中的周
            isSelected = weekStart.isSame(startDate, 'day');
            isStart = weekStart.isSame(startDate, 'day');
          }
        } else {
          // 日选择：判断当前日期是否在选中范围内
          if (endDate) {
            isSelected = currentDay.isBetween(startDate, endDate, 'day', '[]');
            isStart = currentDay.isSame(startDate, 'day');
            isEnd = currentDay.isSame(endDate, 'day');
          } else {
            // 只有开始日期时，高亮当前选中的日期
            isSelected = currentDay.isSame(startDate, 'day');
            isStart = currentDay.isSame(startDate, 'day');
          }
        }
      }

      // 创建本地日期对象，避免时区问题
      const localDay = dayjs(currentDay.format('YYYY-MM-DD'));

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
          onClick={() => handleDateSelect(localDay)}
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
    // 确保只显示当前年份的4个季度
    const currentYear = currentDate.year();
    const quarters = [1, 2, 3, 4].map(q => {
      // 使用 dayjs 的 quarter API 正确设置季度
      return dayjs().year(currentYear).quarter(q);
    });
    
    console.log({quarters})
    
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
              key={`${q.year()}-Q${q.quarter()}`}
              className={`date-range-picker__quarter-btn ${isSelected ? 'selected' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
              onClick={() => handleButtonSelect(q)}
            >
              Q{q.quarter()}季度
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