import Papa from 'papaparse';

// 참여자 타입 정의
export interface Participant {
  name: string;
  gender: string;
  age: number;
  marriage: string;
  congregation: string;
  count: number;
  participationDates: string;
}

// 차트 데이터 타입 정의
export interface ChartDataItem {
  name: string;
  value: number;
  rank?: number;
}

// 캘린더 데이터 타입 정의
export interface CalendarItem {
  isHeader?: boolean;
  text?: string;
  isEmpty?: boolean;
  name?: string;
  value?: number;
  originalDate?: string;
}

// CSV에서 참여자 데이터 로드
export async function loadParticipantsDataFromCSV(): Promise<Record<string, Participant[]> | null> {
  try {
    const response = await fetch('/data/participants.csv');
    const csvText = await response.text();
    const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    // 데이터 구조 변환
    const participantsByDate: Record<string, Participant[]> = {};
    (data as any[]).forEach(row => {
      // row에서 필요한 필드 추출 및 변환
      // 예시: 날짜별로 그룹화
      const date = row['날짜'] || row['참여일자'];
      if (!participantsByDate[date]) participantsByDate[date] = [];
      participantsByDate[date].push({
        name: row['이름'],
        gender: row['성별'],
        age: Number(row['나이']),
        marriage: row['결혼'],
        congregation: row['회중'],
        count: Number(row['참여일수']),
        participationDates: row['참여일자'],
      });
    });
    return participantsByDate;
  } catch (error) {
    console.error('참여자 데이터 로딩 중 오류:', error);
    return null;
  }
}

// 모든 참여자 데이터를 단일 배열로 로드
export async function loadAllParticipantsFromCSV(): Promise<Participant[] | null> {
  try {
    const response = await fetch('/data/participants.csv');
    const csvText = await response.text();
    
    const parsedData = Papa.parse<Participant>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    }).data;
    
    return parsedData;
  } catch (error) {
    console.error('참여자 데이터 로딩 중 오류:', error);
    return null;
  }
}

// 성별 데이터 계산
export function calculateGenderData(participants: Participant[]): ChartDataItem[] {
  const genderCount: Record<string, number> = {
    '형제': 0,
    '자매': 0
  };
  
  // 중복 참여자 제거 (동일 참여자가 여러 날짜에 참여할 수 있음)
  const uniqueParticipants = [...new Map(participants.map(p => [p.name, p])).values()];
  
  uniqueParticipants.forEach(participant => {
    if (participant.gender === '형제' || participant.gender === '자매') {
      genderCount[participant.gender]++;
    }
  });
  
  return [
    { name: '형제', value: genderCount['형제'] },
    { name: '자매', value: genderCount['자매'] }
  ];
}

// 연령대 데이터 계산
export function calculateAgeData(participants: Participant[]): ChartDataItem[] {
  const ageGroups: Record<string, number> = {
    '10대': 0,
    '20대': 0,
    '30대': 0,
    '40대': 0,
    '50대': 0,
    '60대': 0,
    '70대': 0
  };
  
  // 중복 참여자 제거
  const uniqueParticipants = [...new Map(participants.map(p => [p.name, p])).values()];
  
  uniqueParticipants.forEach(participant => {
    const age = participant.age;
    
    if (age >= 10 && age < 20) ageGroups['10대']++;
    else if (age >= 20 && age < 30) ageGroups['20대']++;
    else if (age >= 30 && age < 40) ageGroups['30대']++;
    else if (age >= 40 && age < 50) ageGroups['40대']++;
    else if (age >= 50 && age < 60) ageGroups['50대']++;
    else if (age >= 60 && age < 70) ageGroups['60대']++;
    else if (age >= 70) ageGroups['70대']++;
  });
  
  return Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
}

// 결혼 여부 데이터 계산
export function calculateMarriageData(participants: Participant[]): ChartDataItem[] {
  const marriageCount: Record<string, number> = {
    '기혼': 0,
    '미혼': 0
  };
  
  // 중복 참여자 제거
  const uniqueParticipants = [...new Map(participants.map(p => [p.name, p])).values()];
  
  uniqueParticipants.forEach(participant => {
    if (participant.marriage === '기혼' || participant.marriage === '미혼') {
      marriageCount[participant.marriage]++;
    }
  });
  
  return [
    { name: '기혼', value: marriageCount['기혼'] },
    { name: '미혼', value: marriageCount['미혼'] }
  ];
}

// 참여 일수 데이터 계산
export function calculateParticipationData(participants: Participant[]): ChartDataItem[] {
  const participationCounts: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
  };
  
  // 중복 참여자 제거
  const uniqueParticipants = [...new Map(participants.map(p => [p.name, p])).values()];
  
  uniqueParticipants.forEach(participant => {
    const count = participant.count;
    if (count >= 1 && count <= 6) {
      participationCounts[count]++;
    }
  });
  
  return Object.entries(participationCounts).map(([key, value]) => ({
    name: `${key}일`,
    value
  }));
}

// 회중 데이터 계산
export function calculateCongregationData(participants: Participant[]): ChartDataItem[] {
  const congregationCounts: Record<string, number> = {};
  
  // 중복 참여자 제거
  const uniqueParticipants = [...new Map(participants.map(p => [p.name, p])).values()];
  
  uniqueParticipants.forEach(participant => {
    const congregation = participant.congregation;
    if (congregation) {
      congregationCounts[congregation] = (congregationCounts[congregation] || 0) + 1;
    }
  });
  
  // 상위 15개 회중만 선택하고 내림차순 정렬
  const sortedCongregations = Object.entries(congregationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, value], index) => ({
      name,
      value,
      rank: index + 1
    }));
  
  return sortedCongregations;
}

// 지역별 데이터 계산
export function calculateRegionData(participants: Participant[]): ChartDataItem[] {
  const regionCounts: Record<string, number> = {};
  
  // 중복 참여자 제거
  const uniqueParticipants = [...new Map(participants.map(p => [p.name, p])).values()];
  
  uniqueParticipants.forEach(participant => {
    // 회중 이름에서 지역 추출 (예: '경기평택지산' -> '경기')
    const congregation = participant.congregation;
    if (congregation) {
      const regionMatch = congregation.match(/^(경기|충북|경남|전북|인천|부산|울산|대전|강원|서울|경북|전남|충남|제주)/);
      if (regionMatch) {
        const region = regionMatch[1];
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    }
  });
  
  // 내림차순 정렬
  return Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

// 캘린더 데이터 계산
export function calculateCalendarData(participantsByDate: Record<string, Participant[]>): CalendarItem[] {
  // 헤더 준비
  const calendarData: CalendarItem[] = [
    { isHeader: true, text: '일' },
    { isHeader: true, text: '월' },
    { isHeader: true, text: '화' },
    { isHeader: true, text: '수' },
    { isHeader: true, text: '목' },
    { isHeader: true, text: '금' },
    { isHeader: true, text: '토' },
  ];
  
  // 날짜 범위 정의 (4월 21일 ~ 5월 18일)
  const dateMapping: Record<string, { weekday: string, position: number }> = {
    '4월 21일': { weekday: '월', position: 8 },
    '4월 22일': { weekday: '화', position: 9 },
    '4월 23일': { weekday: '수', position: 10 },
    '4월 24일': { weekday: '목', position: 11 },
    '4월 25일': { weekday: '금', position: 12 },
    '4월 26일': { weekday: '토', position: 13 },
    '4월 27일': { weekday: '일', position: 14 },
    '4월 28일': { weekday: '월', position: 15 },
    '4월 29일': { weekday: '화', position: 16 },
    '4월 30일': { weekday: '수', position: 17 },
    '5월 1일': { weekday: '목', position: 18 },
    '5월 2일': { weekday: '금', position: 19 },
    '5월 3일': { weekday: '토', position: 20 },
    '5월 4일': { weekday: '일', position: 21 },
    '5월 5일': { weekday: '월', position: 22 },
    '5월 6일': { weekday: '화', position: 23 },
    '5월 7일': { weekday: '수', position: 24 },
    '5월 8일': { weekday: '목', position: 25 },
    '5월 9일': { weekday: '금', position: 26 },
    '5월 10일': { weekday: '토', position: 27 },
    '5월 11일': { weekday: '일', position: 28 },
    '5월 12일': { weekday: '월', position: 29 },
    '5월 13일': { weekday: '화', position: 30 },
    '5월 14일': { weekday: '수', position: 31 },
    '5월 15일': { weekday: '목', position: 32 },
    '5월 16일': { weekday: '금', position: 33 },
    '5월 17일': { weekday: '토', position: 34 },
    '5월 18일': { weekday: '일', position: 35 }
  };
  
  // 달력 템플릿 초기화
  for (let i = 7; i < 42; i++) {
    calendarData.push({ isEmpty: true });
  }
  
  // 참여자 수에 따라 달력 채우기
  Object.entries(participantsByDate).forEach(([date, participants]) => {
    if (dateMapping[date]) {
      const { position, weekday } = dateMapping[date];
      calendarData[position] = {
        name: `${date} (${weekday})`,
        value: participants.length,
        isEmpty: false,
        originalDate: date
      };
    }
  });
  
  // 비어있는 날짜 처리 (데이터가 없는 날)
  Object.entries(dateMapping).forEach(([date, { position, weekday }]) => {
    if (calendarData[position].isEmpty) {
      calendarData[position] = {
        name: `${date} (${weekday})`,
        value: 0,
        isEmpty: false,
        originalDate: date
      };
    }
  });
  
  return calendarData;
}

// 평균 연령 계산
export function calculateAverageAge(participants: Participant[]): string {
  // 중복 참여자 제거
  const uniqueParticipants = [...new Map(participants.map(p => [p.name, p])).values()];
  
  if (uniqueParticipants.length === 0) return "0";
  
  const sum = uniqueParticipants.reduce((acc, curr) => acc + (curr.age || 0), 0);
  const avg = sum / uniqueParticipants.length;
  
  return avg.toFixed(1);
}

// 폴백 하드코딩 데이터 (데이터 로딩 실패 시 사용)
export const hardcodedFallbackData = {
  // 여기에 원본 파일의 하드코딩 데이터를 넣을 수 있습니다
  // 너무 길기 때문에 일부만 포함시킴
  genderData: [
    { name: '형제', value: 33 },
    { name: '자매', value: 71 }
  ],
  // 다른 폴백 데이터도 필요에 따라 추가
};
