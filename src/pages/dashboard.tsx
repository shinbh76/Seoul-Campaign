import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useParticipantsData } from '../hooks/useParticipantsData';
import CampaignSchedule from '../components/CampaignSchedule';
import { CalendarItem } from '../models/Participant';

// 데이터 파일 경로
const DATA_FILE_PATH = '/data/participants.csv';

// Props 타입 정의 추가
interface DashboardProps {
  displayMode?: string | string[];
}

function Dashboard({ displayMode }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('volunteer');
  const [selectedDate, setSelectedDate] = useState('');
  
  // 참여자 데이터 훅 사용
  const {
    loading,
    error,
    allParticipants,
    participantsByDate,
    genderData,
    ageData,
    marriageData,
    participationData,
    congregationData,
    regionData,
    calendarData,
    averageAge,
    totalParticipants,
    maxParticipantsDates
  } = useParticipantsData(DATA_FILE_PATH);
  
  useEffect(() => {
    // 디버깅 로그: 데이터가 로드되었을 때 날짜별 참여자 수 확인
    if (!loading && participantsByDate) {
      console.log('날짜별 참여자 수 (Dashboard):', Object.keys(participantsByDate).map(date => 
        `${date}: ${participantsByDate[date].length}명`
      ));
      
      console.log('캘린더 데이터:', calendarData);
    }
  }, [loading, participantsByDate, calendarData]);
  
  // 컴포넌트 마운트 시 현재 날짜를 자동으로 선택
  useEffect(() => {
    if (!loading && calendarData.length > 0) {
      // 현재 날짜에 해당하는 데이터 찾기
      const today = new Date();
      const month = today.getMonth() + 1; // 0부터 시작하므로 1 더함
      const day = today.getDate();
      
      // 캠페인 기간 (2025년 4월 21일 ~ 5월 18일) 내에 있는지 확인
      let targetDate = '';
      
      // 현재 날짜가 캠페인 기간 내에 있는지 확인
      if ((month === 4 && day >= 21) || (month === 5 && day <= 18)) {
        targetDate = `${month}월 ${day}일`;
      } else {
        // 캠페인 기간이 아니면 기본값으로 설정
        targetDate = calendarData[0]?.originalDate || '4월 27일';
      }
      
      // 해당 날짜가 캘린더 데이터에 있는지 확인
      const dateExists = calendarData.some(
        (item: CalendarItem) => !item.isHeader && !item.isEmpty && item.originalDate === targetDate
      );
      
      if (dateExists) {
        setSelectedDate(targetDate);
      } else {
        // 없으면 첫 번째 유효한 날짜로 설정
        const firstValidDate = calendarData.find((item: CalendarItem) => !item.isHeader && !item.isEmpty);
        if (firstValidDate && firstValidDate.originalDate) {
          setSelectedDate(firstValidDate.originalDate);
        }
      }
    }
  }, [loading, calendarData]);
  
  if (loading) {
    return <div className="loading-container">데이터를 불러오는 중입니다...</div>;
  }
  
  if (error) {
    return <div className="error-container">오류: {error}</div>;
  }
  
  // 날짜별 참여자 수
  const participantCounts = Object.entries(participantsByDate).map(([date, participants]) => ({
    date,
    count: participants.length
  }));
  
  // 차트 색상
  const COLORS = [
    '#9333ea', // 기본 보라색
    '#a855f7', // 연한 보라색
    '#7e22ce', // 진한 보라색
    '#6b21a8', // 매우 진한 보라색
    '#c084fc', // 라일락
    '#d8b4fe', // 밝은 라일락
    '#8b5cf6', // 인디고 계열
    '#a78bfa'  // 연한 인디고
  ];
  const GENDER_COLORS = ['#a78bfa', '#6a0dad']; // 연보라, 진한 보라
  const MARRIAGE_COLORS = ['#a991f7', '#6a0dad']; // 연보라, 진한 보라
  const AGE_COLORS = [
    '#a78bfa', // 연한 보라
    '#7e22ce', // 진한 보라
    '#4f46e5', // 인디고
    '#4338ca', // 진한 인디고
    '#6366f1', // 블루 퍼플
    '#8b5cf6', // 라이트 퍼플
    '#9ca3af'  // 그레이
  ];
  const PARTICIPATION_COLORS = [
    '#a78bfa', // 연한 보라
    '#8b5cf6', // 중간 보라
    '#7c3aed', // 진한 보라
    '#4f46e5', // 인디고
    '#6366f1', // 블루 퍼플
    '#9ca3af'  // 그레이
  ];
  const CONGREGATION_COLORS = [
    '#a78bfa', // 연한 보라
    '#8b5cf6', // 약간 진한 보라
    '#7c3aed', // 중간 보라
    '#6d28d9', // 진한 보라
    '#5b21b6', // 더 진한 보라
    '#4f46e5', // 인디고
    '#4338ca', // 진한 인디고
    '#3730a3', // 더 진한 인디고
    '#6366f1', // 블루 퍼플
    '#818cf8', // 연한 인디고
    '#93c5fd', // 연한 블루
    '#9ca3af', // 그레이
    '#d1d5db', // 연한 그레이
    '#4b5563', // 진한 그레이
    '#374151'  // 아주 진한 그레이
  ];
  
  const REGION_COLORS = [
    '#a78bfa', // 연한 보라
    '#8b5cf6', // 라이트 퍼플
    '#6d28d9', // 진한 보라
    '#4f46e5', // 인디고
    '#6366f1', // 블루 퍼플
    '#818cf8', // 연한 인디고
    '#93c5fd', // 연한 블루
    '#9ca3af', // 그레이
    '#d1d5db', // 연한 그레이
    '#4b5563'  // 진한 그레이
  ];
  
  // 현재 선택된 날짜의 참여자 목록
  const selectedDateParticipants = selectedDate ? participantsByDate[selectedDate] || [] : [];
  
  // 선택된 탭에 따라 렌더링할 내용 결정
  const renderContent = () => {
    switch (activeTab) {
      case 'volunteer':
        return <CampaignSchedule />;
      case 'date':
        return (
          <div className="chart-container">
            <h2 className="chart-title">참여자 캘린더</h2>
            
            <div className="calendar-container">
              <div className="calendar-grid">
                {calendarData.map((item: CalendarItem, index: number) => {
                  if (item.isHeader) {
                    return (
                      <div key={`header-${index}`} className="day-header" style={{ fontSize: '120%' }}>
                        {item.text}
                      </div>
                    );
                  }
                  
                  if (item.isEmpty) {
                    return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                  }
                  
                  const isSelected = item.originalDate === selectedDate;
                  const participantCount = item.value || 0;
                  
                  // 참여자 수에 따른 배경색 및 텍스트 색상 설정
                  let backgroundColor = '';
                  let textColor = 'rgb(51, 51, 51)'; // 기본 텍스트 색상
                  
                  // 참여자 수에 따른 배경색 지정
                  switch (participantCount) {
                    case 0:
                      backgroundColor = 'rgba(240, 240, 245, 0.8)';
                      break;
                    case 1:
                      backgroundColor = 'rgba(147, 112, 219, 0.05)';
                      break;
                    case 2:
                      backgroundColor = 'rgba(147, 112, 219, 0.1)';
                      break;
                    case 3:
                      backgroundColor = 'rgba(147, 112, 219, 0.15)';
                      break;
                    case 4:
                      backgroundColor = 'rgba(147, 112, 219, 0.2)';
                      break;
                    case 5:
                      backgroundColor = 'rgba(147, 112, 219, 0.25)';
                      break;
                    case 6:
                      backgroundColor = 'rgba(147, 112, 219, 0.3)';
                      break;
                    case 7:
                      backgroundColor = 'rgba(147, 112, 219, 0.35)';
                      break;
                    case 8:
                      backgroundColor = 'rgba(147, 112, 219, 0.4)';
                      break;
                    case 9:
                      backgroundColor = 'rgba(147, 112, 219, 0.45)';
                      break;
                    case 10:
                      backgroundColor = 'rgba(147, 112, 219, 0.5)';
                      break;
                    case 11:
                      backgroundColor = 'rgba(147, 112, 219, 0.55)';
                      break;
                    case 12:
                      backgroundColor = 'rgba(147, 112, 219, 0.6)';
                      textColor = 'white';
                      break;
                    case 13:
                      backgroundColor = 'rgba(147, 112, 219, 0.65)';
                      textColor = 'white';
                      break;
                    case 14:
                      backgroundColor = 'rgba(147, 112, 219, 0.7)';
                      textColor = 'white';
                      break;
                    case 15:
                      backgroundColor = 'rgba(147, 112, 219, 0.75)';
                      textColor = 'white';
                      break;
                    case 16:
                      backgroundColor = 'rgba(147, 112, 219, 0.8)';
                      textColor = 'white';
                      break;
                    case 17:
                      backgroundColor = 'rgba(147, 112, 219, 0.85)';
                      textColor = 'white';
                      break;
                    case 18:
                      backgroundColor = 'rgba(147, 112, 219, 0.9)';
                      textColor = 'white';
                      break;
                    default: // 19명 이상
                      backgroundColor = 'rgba(147, 112, 219, 0.9)';
                      textColor = 'white';
                      break;
                  }
                  
                  return (
                    <div
                      key={`day-${index}`}
                      className={`calendar-day ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedDate(item.originalDate || '');
                        // 참여자 명단 제목으로 스크롤
                        setTimeout(() => {
                          const titleElement = document.getElementById('participants-title');
                          if (titleElement) {
                            titleElement.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      style={{
                        background: backgroundColor
                      }}
                    >
                      <div className="day-date" style={{ 
                        fontSize: '100%',
                        color: textColor 
                      }}>{item.name}</div>
                      <div className="day-value" style={{ 
                        color: textColor,
                        fontSize: '120%'
                      }}>{participantCount}명</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="participants-section" style={{ 
              width: '100%', 
              margin: '0 auto',
              maxWidth: '900px'
            }}>
              <h3 id="participants-title" className="participants-title" style={{ fontSize: '167%' }}>{selectedDate} 참여자 명단 ({selectedDateParticipants.length}명)</h3>
              
              {selectedDateParticipants.length > 0 ? (
                <div className="participants-table-container">
                  <table className="participants-table" style={{ fontSize: '109%' }}>
                    <thead>
                      <tr>
                        <th style={{ fontSize: '109%' }}>참여자</th>
                        {displayMode !== '1' && <th style={{ fontSize: '109%' }}>결혼</th>}
                        <th style={{ fontSize: '109%' }}>회중</th>
                        <th style={{ fontSize: '109%' }}>참여 일자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDateParticipants.map((participant, index) => {
                        // 날짜 문자열 처리 함수
                        const formatDateString = (dateStr: string): { formattedDates: string; count: number } => {
                          if (!dateStr) return { formattedDates: '', count: 0 };

                          // 날짜 포맷 변경 (5월 7일 -> 5/7)
                          const dates = dateStr.split(',').map(date => {
                            date = date.trim();
                            if (!date) return '';
                            
                            const match = date.match(/(\d+)월 (\d+)일/);
                            if (match) {
                              return `${match[1]}/${match[2]}`;
                            }
                            return date;
                          }).filter(date => date !== '');
                          
                          // 총 참여 일수
                          const participationCount = dates.length;
                          
                          // 날짜를 숫자로 변환하여 연속성 확인
                          const extractedDates = dates.map(date => {
                            const parts = date.split('/');
                            const month = parseInt(parts[0]);
                            const day = parseInt(parts[1]);
                            return { month, day, original: date };
                          });
                          
                          // 날짜를 월별로 그룹화하고 일자별로 정렬
                          type DateGroup = { month: number; day: number; original: string };
                          const monthGroups: { [key: number]: DateGroup[] } = {};
                          extractedDates.forEach(d => {
                            if (!monthGroups[d.month]) {
                              monthGroups[d.month] = [];
                            }
                            monthGroups[d.month].push(d);
                          });
                          
                          // 각 월 내에서 연속된 날짜 그룹 찾기
                          const result: string[] = [];

                          Object.keys(monthGroups).forEach(month => {
                            const days = monthGroups[parseInt(month)].sort((a, b) => a.day - b.day);
                            let currentGroup = [days[0]];
                            
                            for (let i = 1; i < days.length; i++) {
                              if (days[i].day === days[i-1].day + 1) {
                                // 연속된 날짜
                                currentGroup.push(days[i]);
                              } else {
                                // 연속이 끊김, 현재 그룹 처리
                                if (currentGroup.length >= 2) {
                                  // 2일 이상 연속인 경우 압축 표시
                                  const first = currentGroup[0];
                                  const last = currentGroup[currentGroup.length - 1];
                                  if (first.month === last.month) {
                                    // 같은 월이면 월 표시는 한 번만
                                    result.push(`${first.month}/${first.day}~${last.day}`);
                                  } else {
                                    result.push(`${first.original}~${last.original}`);
                                  }
                                } else {
                                  // 1일이면 개별 표시
                                  currentGroup.forEach(d => result.push(d.original));
                                }
                                // 새 그룹 시작
                                currentGroup = [days[i]];
                              }
                            }
                            
                            // 마지막 그룹 처리
                            if (currentGroup.length >= 2) {
                              const first = currentGroup[0];
                              const last = currentGroup[currentGroup.length - 1];
                              if (first.month === last.month) {
                                result.push(`${first.month}/${first.day}~${last.day}`);
                              } else {
                                result.push(`${first.original}~${last.original}`);
                              }
                            } else {
                              currentGroup.forEach(d => result.push(d.original));
                            }
                          });
                          
                          return {
                            formattedDates: result.join(', '),
                            count: participationCount
                          };
                        };
                        
                        // 참여일자 처리
                        const { formattedDates, count } = formatDateString(participant.participationDates);
                        const formattedParticipationDates = `${formattedDates} (${count}일)`;
                        
                        // 이름 처리 함수
                        const formatName = (name: string, gender: string, age: number) => {
                          if (displayMode === '1') {
                            // /1 경로: 이름 마스킹, 나이 미표시
                            if (name.length <= 2) return `${name} ${gender}`;
                            return `${name.charAt(0)}*${name.substring(2)} ${gender}`;
                          } else {
                            // /0 경로: 전체 정보 표시
                            return `${name} ${gender}(${age})`;
                          }
                        };
                        
                        return (
                          <tr key={`${participant.name}-${index}`} className={index % 2 === 0 ? 'even' : 'odd'}>
                            <td style={{ fontSize: '109%' }}>{formatName(participant.name, participant.gender, participant.age)}</td>
                            {displayMode !== '1' && <td style={{ fontSize: '109%' }}>{participant.marriage}</td>}
                            <td style={{ fontSize: '109%' }}>{participant.congregation}</td>
                            <td style={{ fontSize: '109%' }}>{formattedParticipationDates}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-participants" style={{ 
                  textAlign: 'center',
                  background: '#f0f0f0',
                  color: '#777',
                  padding: '1.5rem',
                  borderRadius: '5px',
                  width: '100%',
                  margin: '1rem auto'
                }}>해당 날짜에 참여자가 없습니다.</p>
              )}
              
              <div className="participation-summary">
                <p style={{ fontSize: '90%' }}>참여자 수 최다 일자: {maxParticipantsDates.maxDates.join(', ')} ({maxParticipantsDates.maxCount}명)</p>
                <p style={{ fontSize: '1.17rem' }}>전체 캠페인 일정: {calendarData.filter((item: CalendarItem) => !item.isHeader && !item.isEmpty).length}일</p>
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(147, 51, 234, 0.1)', borderRadius: '8px', border: '2px solid rgba(147, 51, 234, 0.3)' }}>
                  <p style={{ fontSize: '1.17rem', fontWeight: 'bold', color: '#9333ea' }}>캠페인 참여 인원: {totalParticipants}명</p>
                  <p style={{ fontSize: '1.17rem', fontWeight: 'bold', color: '#9333ea' }}>봉사 참여 연인원: {Object.values(participantsByDate).reduce((sum, participants) => sum + participants.length, 0)}명</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'congregation':
        // 순위가 포함된 회중 데이터 준비
        // 값이 동일한 경우 공동 순위로 표시하기 위한 로직 추가
        const rankedCongregationData = (() => {
          // 값에 따라 정렬
          const sortedData = [...congregationData].sort((a, b) => b.value - a.value);
          let currentRank = 1;
          let previousValue = -1;
          let result = [];

          for (let i = 0; i < sortedData.length; i++) {
            const item = sortedData[i];
            // 이전 값과 동일하면 순위 유지, 다르면 현재 인덱스+1로 순위 설정
            if (item.value !== previousValue) {
              currentRank = i + 1;
              previousValue = item.value;
            }
            
            // 순위를 표시할 이름 생성
            result.push({
              ...item,
              name: `${item.name} (${currentRank}위)`
            });
          }
          return result;
        })();
        
        return (
          <div className="chart-container">
            <h2 className="chart-title">참여 회중</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={900}>
                <BarChart
                  data={rankedCongregationData}
                  layout="vertical"
                  margin={{ top: 20, right: 80, left: 150, bottom: 20 }}
                  barCategoryGap={8}
                  maxBarSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickCount={9} domain={[0, 8]} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    style={{ fontSize: '0.9rem' }}
                    tick={({ x, y, payload }) => (
                      <text x={x} y={y} dy={3} textAnchor="end" fill="#333" fontSize={14} fontWeight="500">
                        {payload.value}
                      </text>
                    )}
                  />
                  <Tooltip formatter={(value) => [`${value}명`, '참여자 수']} />
                  <Bar 
                    dataKey="value" 
                    fill="#8884d8" 
                    name="참여자 수" 
                    label={{ position: 'insideRight', fill: '#FFFFFF', fontWeight: 'bold', fontSize: 11, formatter: (value: number) => `${value}명` }}
                  >
                    {rankedCongregationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CONGREGATION_COLORS[index % CONGREGATION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-summary">
              <p style={{ color: '#9333ea', fontWeight: 'bold' }}>총 참여 회중 수: {Object.keys(
                Array.from(new Map(allParticipants.map(p => [p.congregation, p])).values())
                .reduce((acc, p) => {
                  if (p.congregation) acc[p.congregation] = true;
                  return acc;
                }, {} as Record<string, boolean>)
              ).length}개</p>
              <p>가장 많은 참여 회중: {congregationData[0]?.name} ({congregationData[0]?.value}명)</p>
            </div>
          </div>
        );
        
      case 'gender':
        return (
          <div className="chart-container">
            <h2 className="chart-title">성별 분포</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}명`, '참여자 수']} />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    layout="horizontal"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-summary">
              <p style={{ color: '#9333ea', fontWeight: 'bold' }}>총 참여자: <span>{totalParticipants}명</span></p>
              <p>형제: {genderData[0]?.value || 0}명 ({((genderData[0]?.value || 0) / totalParticipants * 100).toFixed(1)}%)</p>
              <p>자매: {genderData[1]?.value || 0}명 ({((genderData[1]?.value || 0) / totalParticipants * 100).toFixed(1)}%)</p>
            </div>
          </div>
        );
        
      case 'age':
        return (
          <div className="chart-container">
            <h2 className="chart-title">연령대 분포</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}명`, '참여자 수']} />
                  <Bar dataKey="value" fill="#8884d8" name="참여자 수" label={({ x, y, width, value }) => {
                    const percent = ((value / totalParticipants) * 100).toFixed(0);
                    return <text x={x + width / 2} y={y - 10} fill="#9333ea" textAnchor="middle" dominantBaseline="middle">
                      {value}명 ({percent}%)
                    </text>;
                  }}>
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-summary">
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <p style={{ color: '#9333ea', fontWeight: 'bold', fontSize: '1.5rem' }}>평균 연령: {averageAge}세</p>
              </div>
              <p>가장 많은 연령대: {ageData.reduce((max, item) => item.value > max.value ? item : max, { name: '', value: 0 }).name}</p>
              <p style={{ color: '#9333ea', fontWeight: 'bold' }}>총 인원: <span>{totalParticipants}명</span></p>
            </div>
          </div>
        );
        
      case 'marriage':
        return (
          <div className="chart-container">
            <h2 className="chart-title">결혼 여부</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={marriageData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marriageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MARRIAGE_COLORS[index % MARRIAGE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}명`, '참여자 수']} />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    layout="horizontal"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-summary">
              <p style={{ color: '#9333ea', fontWeight: 'bold' }}>총 인원: <span>{totalParticipants}명</span></p>
              <p>기혼: {marriageData[0]?.value || 0}명 ({((marriageData[0]?.value || 0) / totalParticipants * 100).toFixed(1)}%)</p>
              <p>미혼: {marriageData[1]?.value || 0}명 ({((marriageData[1]?.value || 0) / totalParticipants * 100).toFixed(1)}%)</p>
            </div>
          </div>
        );
        
      case 'participation':
        // 7일은 0%이므로 6일까지만 표시
        const filteredParticipationData = participationData.filter(item => item.name !== '7일');
        
        return (
          <div className="chart-container">
            <h2 className="chart-title">참여 일수</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={filteredParticipationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}명`, '참여자 수']} />
                  <Bar dataKey="value" fill="#8884d8" name="참여자 수" label={({ x, y, width, value }) => {
                    const percent = ((value / totalParticipants) * 100).toFixed(0);
                    return <text x={x + width / 2} y={y - 10} fill="#9333ea" textAnchor="middle" dominantBaseline="middle">
                      {value}명 ({percent}%)
                    </text>;
                  }}>
                    {filteredParticipationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PARTICIPATION_COLORS[index % PARTICIPATION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-summary">
              <p>가장 많은 참여 일수: {
                participationData.reduce((max, item) => item.value > max.value ? item : max, { name: '', value: 0 }).name
              } ({
                participationData.reduce((max, item) => item.value > max.value ? item : max, { name: '', value: 0 }).value
              }명)</p>
              <p style={{ color: '#9333ea', fontWeight: 'bold' }}>총 참여자: <span>{totalParticipants}명</span></p>
              
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(147, 51, 234, 0.1)', borderRadius: '8px', border: '2px solid rgba(147, 51, 234, 0.3)' }}>
                <p style={{ fontSize: '1.17rem', fontWeight: 'bold', color: '#9333ea' }}>캠페인 참여 인원: {totalParticipants}명</p>
                <p style={{ fontSize: '1.17rem', fontWeight: 'bold', color: '#9333ea' }}>봉사 참여 연인원: {Object.values(participantsByDate).reduce((sum, participants) => sum + participants.length, 0)}명</p>
              </div>
            </div>
          </div>
        );
        
      case 'region':
        return (
          <div className="chart-container">
            <h2 className="chart-title">지역별 분포</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={regionData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}명`, '참여자 수']} />
                  <Bar dataKey="value" fill="#8884d8" name="참여자 수" label={({ x, y, width, value }) => {
                    const percent = ((value / totalParticipants) * 100).toFixed(0);
                    return <text x={x + width / 2} y={y - 10} fill="#9333ea" textAnchor="middle" dominantBaseline="middle">
                      {value}명 ({percent}%)
                    </text>;
                  }}>
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-summary">
              <p style={{ color: '#9333ea', fontWeight: 'bold' }}>참여 지역 수: {regionData.length}개 지역</p>
              <p>가장 많은 참여 지역: {regionData[0]?.name} ({regionData[0]?.value}명)</p>
            </div>
          </div>
        );
        
      default:
        return <div>선택된 탭이 없습니다.</div>;
    }
  };
  
  return (
    <div className="dashboard-container">
      <header style={{ backgroundColor: 'rgb(126 34 206)' }}>
        <h1 style={{ fontSize: '223%' }}>2025 서울 캠페인 in 성수</h1>
        <p style={{ fontSize: '105%' }}>4월 21일 ~ 5월 18일</p>
        <p style={{ fontSize: '105%' }}>총 {totalParticipants}명의 참여자 데이터 분석 결과입니다.</p>
      </header>
      
      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'volunteer' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteer')}
          style={activeTab === 'volunteer' ? { 
            backgroundColor: 'rgb(147 51 234)',
            fontSize: '105%'
          } : { fontSize: '105%' }}
        >
          봉사 마련
        </button>
        <button 
          className={`tab-button ${activeTab === 'date' ? 'active' : ''}`}
          onClick={() => setActiveTab('date')}
          style={activeTab === 'date' ? { 
            backgroundColor: 'rgb(147 51 234)',
            fontSize: '105%'
          } : { fontSize: '105%' }}
        >
          참여자
        </button>
        <button 
          className={`tab-button ${activeTab === 'congregation' ? 'active' : ''}`}
          onClick={() => setActiveTab('congregation')}
          style={activeTab === 'congregation' ? { 
            backgroundColor: 'rgb(147 51 234)',
            fontSize: '105%'
          } : { fontSize: '105%' }}
        >
          참여 회중
        </button>
        <button 
          className={`tab-button ${activeTab === 'gender' ? 'active' : ''}`}
          onClick={() => setActiveTab('gender')}
          style={activeTab === 'gender' ? { 
            backgroundColor: 'rgb(147 51 234)',
            fontSize: '105%'
          } : { fontSize: '105%' }}
        >
          성별
        </button>
        <button 
          className={`tab-button ${activeTab === 'age' ? 'active' : ''}`}
          onClick={() => setActiveTab('age')}
          style={activeTab === 'age' ? { 
            backgroundColor: 'rgb(147 51 234)',
            fontSize: '105%'
          } : { fontSize: '105%' }}
        >
          연령대
        </button>
        <button 
          className={`tab-button ${activeTab === 'marriage' ? 'active' : ''}`}
          onClick={() => setActiveTab('marriage')}
          style={activeTab === 'marriage' ? { 
            backgroundColor: 'rgb(147 51 234)',
            fontSize: '105%'
          } : { fontSize: '105%' }}
        >
          결혼 여부
        </button>
        <button 
          className={`tab-button ${activeTab === 'participation' ? 'active' : ''}`}
          onClick={() => setActiveTab('participation')}
          style={activeTab === 'participation' ? { 
            backgroundColor: 'rgb(147 51 234)',
            fontSize: '105%'
          } : { fontSize: '105%' }}
        >
          참여 일수
        </button>
        <button 
          className={`tab-button ${activeTab === 'region' ? 'active' : ''}`}
          onClick={() => setActiveTab('region')}
          style={activeTab === 'region' ? { 
            backgroundColor: 'rgb(147 51 234)',
            fontSize: '105%'
          } : { fontSize: '105%' }}
        >
          지역별
        </button>
      </div>
      
      {renderContent()}
      
      <footer style={{ fontSize: '1.008rem' }}>
        © 2025 Seoul Campaign in Seongsu
      </footer>
    </div>
  );
}

export default Dashboard; 