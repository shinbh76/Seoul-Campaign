import React, { useEffect, useState } from 'react';
import { loadScheduleData, ScheduleData, hardcodedScheduleData } from '../scheduleUtils';

const CampaignSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [scheduleData, setScheduleData] = useState<ScheduleData>(hardcodedScheduleData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // JSON 파일에서 일정 데이터 로드
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await loadScheduleData();
        if (data) {
          setScheduleData(data);
          console.log('봉사 일정 데이터 로드 성공:', Object.keys(data).length, '개 일정');
        } else {
          console.warn('JSON 파일 로딩 실패, 하드코딩된 데이터를 사용합니다.');
          setScheduleData(hardcodedScheduleData);
        }
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        setScheduleData(hardcodedScheduleData);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // 컴포넌트 마운트 시 현재 날짜 자동 선택
  useEffect(() => {
    if (!isLoading && Object.keys(scheduleData).length > 0) {
      // 현재 날짜 구하기
      const today = new Date();
      const month = today.getMonth() + 1; // 0부터 시작하므로 1 더함
      const day = today.getDate();
      
      // 캠페인 기간 (2025년 4월 21일 ~ 5월 18일) 내에 있는지 확인
      let dateKey = '';
      
      if ((month === 4 && day >= 21 && day <= 30) || (month === 5 && day >= 1 && day <= 18)) {
        // 캠페인 기간이면 해당 날짜로 설정
        dateKey = `2025-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } else {
        // 캠페인 기간이 아니면 기본값으로 설정
        dateKey = Object.keys(scheduleData)[0] || '2025-04-22';
      }
      
      // 해당 날짜가 데이터에 있는지 확인
      if (scheduleData[dateKey]) {
        setSelectedDate(dateKey);
      } else {
        // 없으면 첫번째 유효한 날짜로 설정
        const validDate = Object.keys(scheduleData)[0];
        setSelectedDate(validDate);
      }
    }
  }, [isLoading, scheduleData]);
  
  const handleDateClick = (dateKey: string) => {
    setSelectedDate(dateKey);
    // 선택된 날짜 정보로 스크롤
    setTimeout(() => {
      const titleElement = document.getElementById('schedule-title');
      if (titleElement) {
        titleElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // 선택된 날짜의 봉사 정보
  const selectedSchedule = selectedDate ? scheduleData[selectedDate] : null;
  
  // 왕국회관을 회관으로 변환하는 함수
  const convertLocationName = (location: string | undefined): string => {
    if (!location) return '';
    // 왕국회관을 회관으로 변환
    return location.replace('왕국회관', '회관');
  };
  
  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>봉사 일정 데이터를 불러오는 중...</p>
      </div>
    );
  }
  
  return (
    <div className="chart-container">
      <h1>봉사 캘린더</h1>
      
      <div className="calendar-wrapper">
        <div className="month-label">4월 21일 ~ 5월 18일</div>
        <table className="calendar">
          <thead>
            <tr>
              <th className="sunday">일</th>
              <th>월</th>
              <th>화</th>
              <th>수</th>
              <th>목</th>
              <th>금</th>
              <th>토</th>
            </tr>
          </thead>
          <tbody>
            {/* 4월 셋째 주 */}
            <tr>
              <td className="april sunday">
                <div className="date-number sunday">20</div>
              </td>
              <td className="april">
                <div className="date-number">21</div>
              </td>
              <td className={`april ${selectedDate === '2025-04-22' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-04-22')}>
                <div className="date-number">22</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-04-22']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">주민센터</div>
              </td>
              <td className={`april ${selectedDate === '2025-04-23' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-04-23')}>
                <div className="date-number">23</div>
                <div className="event morning">{scheduleData['2025-04-23']?.morning.location.split(' ')[0] || '뚝섬역'}</div>
                <div className="event afternoon">뚝섬역</div>
              </td>
              <td className={`april ${selectedDate === '2025-04-24' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-04-24')}>
                <div className="date-number">24</div>
                <div className="event morning">{scheduleData['2025-04-24']?.morning.location.split(' ')[0] || '성화공원'}</div>
                <div className="event afternoon">동부여성</div>
              </td>
              <td className={`april ${selectedDate === '2025-04-25' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-04-25')}>
                <div className="date-number">25</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-04-25']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName(scheduleData['2025-04-25']?.afternoon.location.split(' ')[0]) || '회관'}</div>
              </td>
              <td className={`april ${selectedDate === '2025-04-26' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-04-26')}>
                <div className="date-number">26</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-04-26']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
            </tr>
            
            {/* 4월 넷째 주 / 5월 첫째 주 */}
            <tr>
              <td className={`april sunday ${selectedDate === '2025-04-27' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-04-27')}>
                <div className="date-number sunday">27</div>
                <div className="event morning">{scheduleData['2025-04-27']?.morning.location.split(' ')[0] || '집회'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
              <td className="april">
                <div className="date-number">28</div>
              </td>
              <td className={`april ${selectedDate === '2025-04-29' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-04-29')}>
                <div className="date-number">29</div>
                <div className="event morning">주민센터</div>
                <div className="event afternoon">주민센터</div>
              </td>
              <td className={`april ${selectedDate === '2025-04-30' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-04-30')}>
                <div className="date-number">30</div>
                <div className="event morning">{scheduleData['2025-04-30']?.morning.location.split(' ')[0] || '뚝섬역'}</div>
                <div className="event afternoon">뚝섬역</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-01' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-01')}>
                <div className="date-number">1</div>
                <div className="event morning">{scheduleData['2025-05-01']?.morning.location.split(' ')[0] || '성화공원'}</div>
                <div className="event afternoon">동부여성</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-02' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-02')}>
                <div className="date-number">2</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-05-02']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName(scheduleData['2025-05-02']?.afternoon.location.split(' ')[0]) || '회관'}</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-03' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-03')}>
                <div className="date-number">3</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-05-03']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
            </tr>
            
            {/* 5월 첫째 주 */}
            <tr>
              <td className={`may sunday ${selectedDate === '2025-05-04' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-04')}>
                <div className="date-number sunday">4</div>
                <div className="event morning">{scheduleData['2025-05-04']?.morning.location.split(' ')[0] || '집회'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
              <td className={`may sunday ${selectedDate === '2025-05-05' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-05')}>
                <div className="date-number">5</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-05-05']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
              <td className={`may sunday ${selectedDate === '2025-05-06' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-06')}>
                <div className="date-number">6</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-05-06']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-07' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-07')}>
                <div className="date-number">7</div>
                <div className="event morning">{scheduleData['2025-05-07']?.morning.location.split(' ')[0] || '뚝섬역'}</div>
                <div className="event afternoon">뚝섬역</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-08' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-08')}>
                <div className="date-number">8</div>
                <div className="event morning">{scheduleData['2025-05-08']?.morning.location.split(' ')[0] || '성화공원'}</div>
                <div className="event afternoon">동부여성</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-09' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-09')}>
                <div className="date-number">9</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-05-09']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName(scheduleData['2025-05-09']?.afternoon.location.split(' ')[0]) || '회관'}</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-10' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-10')}>
                <div className="date-number">10</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-05-10']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
            </tr>
            
            {/* 5월 둘째 주 */}
            <tr>
              <td className={`may sunday ${selectedDate === '2025-05-11' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-11')}>
                <div className="date-number sunday">11</div>
                <div className="event morning">{scheduleData['2025-05-11']?.morning.location.split(' ')[0] || '집회'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
              <td className="may">
                <div className="date-number">12</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-13' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-13')}>
                <div className="date-number">13</div>
                <div className="event morning">주민센터</div>
                <div className="event afternoon">주민센터</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-14' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-14')}>
                <div className="date-number">14</div>
                <div className="event morning">{scheduleData['2025-05-14']?.morning.location.split(' ')[0] || '뚝섬역'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-15' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-15')}>
                <div className="date-number">15</div>
                <div className="event morning">{scheduleData['2025-05-15']?.morning.location.split(' ')[0] || '성화공원'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-16' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-16')}>
                <div className="date-number">16</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-05-16']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName(scheduleData['2025-05-16']?.afternoon.location.split(' ')[0]) || '회관'}</div>
              </td>
              <td className={`may ${selectedDate === '2025-05-17' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-17')}>
                <div className="date-number">17</div>
                <div className="event morning">{convertLocationName(scheduleData['2025-05-17']?.morning.location.split(' ')[0]) || '회관'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
            </tr>
            
            {/* 5월 셋째 주 */}
            <tr>
              <td className={`may sunday ${selectedDate === '2025-05-18' ? 'selected-day' : ''}`} onClick={() => handleDateClick('2025-05-18')}>
                <div className="date-number sunday">18</div>
                <div className="event morning">{scheduleData['2025-05-18']?.morning.location.split(' ')[0] || '집회'}</div>
                <div className="event afternoon">{convertLocationName('왕국회관')}</div>
              </td>
              <td colSpan={6}></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {selectedSchedule && (
        <div className="schedule-details-container">
          <h3 id="schedule-title" className="schedule-title">{selectedSchedule.date} - 봉사 마련</h3>
          
          <div className="schedule-details">
            {/* 일요일이 아닌 경우에만 오전 봉사 정보 표시 */}
            {!(selectedDate.includes('-04-27') || selectedDate.includes('-05-04') || selectedDate.includes('-05-11') || selectedDate.includes('-05-18')) && (
              <div className="schedule-section">
                <h4>오전 봉사</h4>
                <table className="schedule-table">
                  <tbody>
                    <tr>
                      <th>모임 시간</th>
                      <td>{selectedSchedule.morning.meetingTime || '오전 9시 45분'}</td>
                    </tr>
                    <tr>
                      <th>봉사 시간</th>
                      <td>{selectedSchedule.morning.serviceTime || '오전 10시 ~ 12시'}</td>
                    </tr>
                    <tr>
                      <th>모임 장소</th>
                      <td>{selectedSchedule.morning.location}</td>
                    </tr>
                    <tr>
                      <th>구역</th>
                      <td>{selectedSchedule.morning.area}</td>
                    </tr>
                    <tr>
                      <th>인도자</th>
                      <td>{selectedSchedule.morning.leader}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            {/* 일요일인 경우 주말 집회 표시 */}
            {(selectedDate.includes('-04-27') || selectedDate.includes('-05-04') || selectedDate.includes('-05-11') || selectedDate.includes('-05-18')) && (
              <div className="schedule-section weekend-meeting-container">
                <h4 className="weekend-meeting">주말 집회 (오전 10시)</h4>
              </div>
            )}
            
            <div className="schedule-section">
              <h4>오후 봉사</h4>
              <table className="schedule-table">
                <tbody>
                  <tr>
                    <th>모임 시간</th>
                    <td>{selectedSchedule.afternoon.meetingTime || '오후 1시 50분'}</td>
                  </tr>
                  <tr>
                    <th>봉사 시간</th>
                    <td>{selectedSchedule.afternoon.serviceTime || '오후 2시 ~ 4시'}</td>
                  </tr>
                  <tr>
                    <th>모임 장소</th>
                    <td>{selectedSchedule.afternoon.location}</td>
                  </tr>
                  <tr>
                    <th>구역</th>
                    <td>{selectedSchedule.afternoon.area}</td>
                  </tr>
                  <tr>
                    <th>인도자</th>
                    <td>{selectedSchedule.afternoon.leader}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .chart-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 40px;
          color: #333;
          font-size: 2.03rem;
          font-weight: 700;
        }
        
        .calendar-wrapper {
          width: 100%;
          max-width: 1200px;
          box-sizing: border-box;
          padding: 0 2%;
        }
        
        .month-label {
          background-color: #8e6f4e;
          color: white;
          padding: 8px;
          text-align: center;
          font-weight: bold;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          width: 100%;
          box-sizing: border-box;
          margin: 0;
          font-size: 115%;
        }
        
        .calendar {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin: 0;
          box-sizing: border-box;
        }
        
        .calendar th {
          background-color: #8e6f4e;
          color: white;
          padding: 10px;
          text-align: center;
          border: 1px solid #d9ccba;
          width: 14.28%;
          font-size: 16px;
          box-sizing: border-box;
        }
        
        .calendar td {
          border: 1px solid #d9ccba;
          padding: 10px;
          height: 100px;
          vertical-align: top;
          width: 14.28%;
          box-sizing: border-box;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .calendar td:hover {
          background-color: rgba(224, 217, 207, 0.3);
        }
        
        .selected-day {
          background-color: rgba(147, 112, 219, 0.2) !important;
          border: 2px solid #6A0DAD !important;
        }
        
        .date-number {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 14px;
        }
        
        .event {
          font-size: 12px;
          margin-bottom: 4px;
          padding: 3px;
          border-radius: 3px;
          cursor: pointer;
        }
        
        .event:hover {
          opacity: 0.8;
        }
        
        .morning {
          background-color: #e6f2da;
          border-left: 3px solid #85b554;
        }
        
        .afternoon {
          background-color: #f9e9d3;
          border-left: 3px solid #dea356;
        }
        
        .sunday {
          color: #d85c5c;
        }
        
        .april {
          background-color: #f6fbf2;
        }
        
        .may {
          background-color: #fef7eb;
        }
        
        /* 모달 스타일 삭제, 대체 아래쪽에 정보 표시 */
        .schedule-details-container {
          width: 100%;
          max-width: 1200px;
          margin-top: 30px;
          background-color: #f9f7f3;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(142, 111, 78, 0.1);
          padding: 25px;
          box-sizing: border-box;
          border: 1px solid #e6dfd4;
        }
        
        .schedule-title {
          color: #8e6f4e;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #d9ccba;
          font-size: 28px;
          font-weight: 700;
          text-align: center;
          letter-spacing: -0.5px;
        }
        
        .schedule-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .schedule-section {
          width: 100%;
          margin-bottom: 10px;
          background-color: #fdfbf7;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 3px 6px rgba(142, 111, 78, 0.08);
          transition: transform 0.2s ease;
        }
        
        .schedule-section:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(142, 111, 78, 0.12);
        }
        
        .schedule-section h4 {
          color: #8e6f4e;
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #d9ccba;
        }
        
        .schedule-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 6px;
        }
        
        .schedule-table th,
        .schedule-table td {
          padding: 12px 16px;
          text-align: left;
          border: none;
          vertical-align: middle;
        }
        
        .schedule-table th {
          background-color: #f5f0e5;
          color: #674e31;
          width: 30%;
          font-weight: 600;
          font-size: 16px;
          border-radius: 6px 0 0 6px;
        }
        
        .schedule-table td {
          background-color: #ffffff;
          color: #4b5563;
          border-radius: 0 6px 6px 0;
          font-size: 16px;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(142, 111, 78, 0.05);
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          width: 100%;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #8e6f4e;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .schedule-section {
            width: 100%;
          }
          
          .schedule-table th {
            width: 40%;
          }
        }
        
        .weekend-meeting {
          color: #8e6f4e;
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
        }
        
        .weekend-meeting-container {
          background-color: #f7f3ec;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 0;
          box-shadow: 0 3px 6px rgba(142, 111, 78, 0.08);
          border: none;
          width: 100%;
          transition: transform 0.2s ease;
        }
        
        .weekend-meeting-container:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(142, 111, 78, 0.12);
        }
      `}</style>
    </div>
  );
};

export default CampaignSchedule; 