import * as XLSX from 'xlsx';

// 봉사 일정 타입 정의
export interface ScheduleInfo {
  location: string;
  area: string;
  leader: string;
  meetingTime: string; // 모임 시간
  serviceTime: string; // 봉사 시간
}

export interface DailySchedule {
  date: string;
  morning: ScheduleInfo;
  afternoon: ScheduleInfo;
}

export type ScheduleData = Record<string, DailySchedule>;

/**
 * JSON 파일에서 봉사마련 일정 데이터를 로드합니다.
 * @returns {Promise<ScheduleData | null>} 일정 데이터를 반환하거나 오류 시 null 반환
 */
export async function loadScheduleData(): Promise<ScheduleData | null> {
  try {
    // JSON 파일 다운로드
    const response = await fetch('/봉사마련.json');
    if (!response.ok) {
      throw new Error('봉사마련.json 파일을 찾을 수 없습니다.');
    }
    
    const data = await response.json();
    return data as ScheduleData;
  } catch (error) {
    console.error('봉사 일정 데이터 로딩 중 오류:', error);
    return null;
  }
}

/**
 * 날짜 문자열을 'YYYY-MM-DD' 형식으로 변환합니다.
 * @example '4월 22일' -> '2025-04-22'
 */
export function formatDateKey(dateStr: string): string {
  const match = dateStr.match(/(\d+)월 (\d+)일/);
  if (!match) return '';
  
  const month = match[1].padStart(2, '0');
  const day = match[2].padStart(2, '0');
  return `2025-${month}-${day}`;
}

/**
 * 'YYYY-MM-DD' 형식의 날짜를 '월일(요일)' 형식으로 변환합니다.
 * @example '2025-04-22' -> '4월 22일(화)'
 */
export function formatDisplayDate(dateKey: string): string {
  const match = dateKey.match(/\d{4}-(\d{2})-(\d{2})/);
  if (!match) return '';
  
  const month = parseInt(match[1]);
  const day = parseInt(match[2]);
  
  // 요일 계산
  const date = new Date(dateKey);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  
  return `${month}월 ${day}일(${weekday})`;
}

// 하드코딩된 기본 데이터 (파일 로딩 실패 시 사용)
export const hardcodedScheduleData: ScheduleData = {
  '2025-04-22': {
    date: '4월 22일(화)',
    morning: {
      location: '왕국회관 (뚝섬로5길 19)',
      area: '해당 요일 구역(호별)',
      leader: '신보현 형제 (010-2311-4251)',
      meetingTime: '오전 9시 45분',
      serviceTime: '오전 10시 ~ 12시'
    },
    afternoon: {
      location: '성수1가2동 주민센터',
      area: '서울숲 주변, 카페거리(호별)',
      leader: '신보현 형제 (010-2311-4251)',
      meetingTime: '오후 1시 50분',
      serviceTime: '오후 2시 ~ 4시'
    }
  },
  '2025-04-23': {
    date: '4월 23일(수)',
    morning: {
      location: '뚝섬역 2번출구 (지하철 2호선)',
      area: '해당 요일 구역(호별)',
      leader: '이재영 010-5013-3302',
      meetingTime: '오전 9시 45분',
      serviceTime: '오전 10시 ~ 12시'
    },
    afternoon: {
      location: '뚝섬역 2번출구 (지하철 2호선)',
      area: '지식산업센터(호별)',
      leader: '변창훈 형제 (010-4420-0070)',
      meetingTime: '오후 1시 50분',
      serviceTime: '오후 2시 ~ 4시'
    }
  },
  '2025-05-05': {
    date: '5월 5일(월)',
    morning: {
      location: '왕국회관 (뚝섬로5길 19)',
      area: '성수동 중심가 [전시대+가두+비공식]',
      leader: '신보현 형제 (010-2311-4251)',
      meetingTime: '오전 9시 45분',
      serviceTime: '오전 10시 ~ 12시'
    },
    afternoon: {
      location: '왕국회관 (뚝섬로5길 19)',
      area: '[3시간]서울숲 입구, 한강공원 입구[전시대+가두+공원]',
      leader: '신보현 형제 (010-2311-4251)',
      meetingTime: '오후 1시 50분',
      serviceTime: '오후 2시 ~ 5시'
    }
  },
  '2025-05-06': {
    date: '5월 6일(화)',
    morning: {
      location: '왕국회관 (뚝섬로5길 19)',
      area: '성수동 중심가 [전시대+가두+비공식]',
      leader: '신보현 형제 (010-2311-4251)',
      meetingTime: '오전 9시 45분',
      serviceTime: '오전 10시 ~ 12시'
    },
    afternoon: {
      location: '왕국회관 (뚝섬로5길 19)',
      area: '[3시간]서울숲 입구, 한강공원 입구[전시대+가두+공원]',
      leader: '신보현 형제 (010-2311-4251)',
      meetingTime: '오후 1시 50분',
      serviceTime: '오후 2시 ~ 5시'
    }
  },
  '2025-05-15': {
    date: '5월 15일(목)',
    morning: {
      location: '성화공원 (매봉산 입구)',
      area: '해당 요일 구역(호별)',
      leader: '신보현 형제 (010-2311-4251)',
      meetingTime: '오전 9시 45분',
      serviceTime: '오전 10시 ~ 12시'
    },
    afternoon: {
      location: '왕국회관 (뚝섬로5길 19)',
      area: '[변경] 지식산업센터 (호별)',
      leader: '신보현 형제 (010-2311-4251)',
      meetingTime: '오후 1시 50분',
      serviceTime: '오후 2시 ~ 4시'
    }
  },
}; 