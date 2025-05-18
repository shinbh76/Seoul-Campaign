/**
 * 참여자 정보를 나타내는 인터페이스
 */
export interface Participant {
  /** 참여자 이름 */
  name: string;
  
  /** 성별 ('형제' 또는 '자매') */
  gender: string;
  
  /** 나이 */
  age: number;
  
  /** 결혼 상태 ('기혼' 또는 '미혼') */
  marriage: string;
  
  /** 소속 회중 */
  congregation: string;
  
  /** 참여 일수 */
  count: number;
  
  /** 참여 날짜 (쉼표로 구분된 문자열) */
  participationDates: string;
}

/**
 * 차트 데이터 항목을 나타내는 인터페이스
 */
export interface ChartDataItem {
  /** 항목 이름 */
  name: string;
  
  /** 항목 값 */
  value: number;
  
  /** 순위 (선택 사항) */
  rank?: number;
}

/**
 * 캘린더 항목을 나타내는 인터페이스
 */
export interface CalendarItem {
  /** 헤더 여부 */
  isHeader?: boolean;
  
  /** 표시할 텍스트 */
  text?: string;
  
  /** 빈 셀 여부 */
  isEmpty?: boolean;
  
  /** 날짜 이름 */
  name?: string;
  
  /** 참여자 수 */
  value?: number;
  
  /** 원본 날짜 문자열 */
  originalDate?: string;
} 