import * as XLSX from 'xlsx';
import { Participant } from '../models/Participant';

/**
 * CSV 파일을 읽어서 참여자 데이터로 변환합니다.
 * @param filePath CSV 파일 경로
 * @returns 참여자 데이터 객체
 */
export async function readCsvFile(filePath: string): Promise<Participant[]> {
  try {
    // 브라우저 환경에서는 fetch API를 사용하여 파일을 가져옵니다.
    const response = await fetch(filePath);
    const text = await response.text();
    
    // CSV 파일 파싱 (간단한 파싱 로직)
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    console.log('CSV 헤더:', headers);
    
    const participants: Participant[] = [];
    
    // 첫 번째 줄은 헤더이므로 건너뛰고 두 번째 줄부터 처리
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // CSV 줄을 필드로 분리 (따옴표 고려)
      const values = parseCSVLine(line);
      
      // 필수 필드가 없으면 건너뛰기
      if (!values[2]) continue; // 이름
      
      const name = values[2];
      const gender = values[3]; // 성별
      const age = Number(values[4]) || 0;
      const birthYear = Number(values[5]) || 0;
      const marriage = values[6];
      const congregation = values[1];
      const participationDates = values[7] ? values[7].replace(/"/g, '') : ''; // 따옴표 제거
      
      // 참여 일자 문자열을 쉼표로 분리
      const datesArray = participationDates.split(',').map(d => d.trim());
      const count = datesArray.length;
      
      const participant: Participant = {
        name,
        gender,
        age,
        marriage,
        congregation,
        count,
        participationDates
      };
      
      participants.push(participant);
      
      // 처음 몇 개의 참여자 데이터를 로그로 출력
      if (i <= 5) {
        console.log(`CSV 참여자 ${i}:`, {
          name,
          gender,
          participationDates,
          datesArray
        });
      }
    }
    
    console.log(`CSV에서 ${participants.length}명의 참여자 데이터가 로드되었습니다.`);
    
    return participants;
  } catch (error) {
    console.error('CSV 파일 읽기 오류:', error);
    return [];
  }
}

/**
 * CSV 한 줄을 파싱합니다 (따옴표로 묶인 필드 처리).
 * @param line CSV 줄
 * @returns 파싱된 필드 배열
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * 엑셀 파일을 CSV 형식으로 변환합니다.
 * 간소화된 접근 방식으로 직접 워크시트 값을 읽습니다.
 * @param filePath 엑셀 파일 경로
 * @returns 참여자 데이터 배열
 */
export async function convertExcelToCsvFormat(filePath: string): Promise<Participant[]> {
  try {
    // 브라우저 환경에서는 fetch API를 사용하여 파일을 가져옵니다.
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    
    // 엑셀 파일 파싱
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // 첫 번째 워크시트 선택
    const firstSheetName = workbook.SheetNames[0];
    console.log('시트 이름:', firstSheetName);
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 워크시트 범위 정보 가져오기
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
    console.log('워크시트 범위:', range);
    
    // 열 인덱스를 워크시트 열 문자로 변환하는 함수
    const getColLetter = (index: number): string => {
      let temp, letter = '';
      while (index >= 0) {
        temp = index % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        index = (index / 26) - 1;
      }
      return letter;
    };
    
    // 날짜 데이터 시작점 (K열, 인덱스 10)
    const dateStartColIndex = 10; // K열
    
    // 날짜 목록 추출 (1행의 날짜 정보)
    const dates: { col: number; date: string }[] = [];
    for (let c = dateStartColIndex; c <= range.e.c; c++) {
      const cellAddress = getColLetter(c) + '1';
      const cell = worksheet[cellAddress];
      
      if (!cell) continue;
      
      let dateStr = '';
      
      // 날짜 값 추출
      if (cell.t === 'n' && cell.v) {
        // 숫자 타입 (Excel 날짜)
        const excelDate = XLSX.SSF.parse_date_code(cell.v);
        if (excelDate && (excelDate.m === 4 || excelDate.m === 5)) {
          dateStr = `${excelDate.m}월 ${excelDate.d}일`;
        }
      } else if (cell.v) {
        // 문자열 타입
        const rawValue = String(cell.v);
        
        // 다양한 날짜 형식 처리
        if (rawValue.includes('/')) {
          // 4/21 형식
          const [month, day] = rawValue.split('/').map(Number);
          if ((month === 4 || month === 5) && day >= 1 && day <= 31) {
            dateStr = `${month}월 ${day}일`;
          }
        } else if (rawValue.includes('-')) {
          // 4-21 형식
          const [month, day] = rawValue.split('-').map(Number);
          if ((month === 4 || month === 5) && day >= 1 && day <= 31) {
            dateStr = `${month}월 ${day}일`;
          }
        } else if (rawValue.includes('월') && rawValue.includes('일')) {
          // 이미 '4월 21일' 형식
          dateStr = rawValue;
        } else if (/^\d{3,4}$/.test(rawValue)) {
          // 421 또는 0421 형식
          let month, day;
          if (rawValue.length === 3) {
            month = Number(rawValue[0]);
            day = Number(rawValue.substring(1));
          } else {
            month = Number(rawValue.substring(0, 2));
            day = Number(rawValue.substring(2));
          }
          
          if ((month === 4 || month === 5) && day >= 1 && day <= 31) {
            dateStr = `${month}월 ${day}일`;
          }
        }
      }
      
      // 유효한 날짜만 추가
      if (dateStr && (dateStr.startsWith('4월') || dateStr.startsWith('5월'))) {
        dates.push({ col: c, date: dateStr });
      }
    }
    
    console.log('찾은 날짜:', dates.map(d => `${getColLetter(d.col)}열: ${d.date}`));
    
    if (dates.length === 0) {
      console.error('엑셀 파일에서 날짜 정보를 찾을 수 없습니다.');
      return [];
    }
    
    // 참여자 정보 및 참여 일자 추출
    // 기본 정보 컬럼 위치
    const nameCol = 'C';        // 이름
    const genderCol = 'D';      // 성별
    const congCol = 'E';        // 회중
    const birthYearCol = 'F';   // 출생연도
    const marriageCol = 'H';    // 결혼 여부
    
    // 참여자 Map (중복 제거용)
    const participantMap = new Map<string, {
      name: string;
      gender: string;
      congregation: string;
      birthYear: number;
      age: number;
      marriage: string;
      participatedDates: Set<string>;
    }>();
    
    // 2행부터 끝까지 데이터 처리
    for (let r = 2; r <= range.e.r; r++) {
      // 이름 가져오기 (필수)
      const nameCell = worksheet[nameCol + r];
      if (!nameCell || !nameCell.v) continue;
      
      const name = String(nameCell.v).trim();
      const gender = getString(worksheet, genderCol + r);
      const congregation = getString(worksheet, congCol + r);
      const birthYear = getNumber(worksheet, birthYearCol + r);
      const marriage = getString(worksheet, marriageCol + r);
      
      // 나이 계산 (2025년 기준)
      const age = birthYear ? 2025 - birthYear : 0;
      
      // 참여자 식별자
      const key = `${name}|${gender}|${congregation}|${birthYear}`;
      
      // 참여 일자 확인
      const participatedDates = new Set<string>();
      
      // 각 날짜 컬럼을 확인하여 참여 여부 확인
      for (const dateInfo of dates) {
        const cellAddress = getColLetter(dateInfo.col) + r;
        const cell = worksheet[cellAddress];
        
        // 'O' 표시가 있거나 TRUE, Y, 1 등의 값이 있으면 참여한 것으로 간주
        if (cell && cell.v) {
          const value = String(cell.v).toUpperCase().trim();
          if (value === 'O' || value === 'TRUE' || value === 'Y' || value === 'YES' || value === '1') {
            participatedDates.add(dateInfo.date);
          }
        }
      }
      
      // 참여 날짜가 있는 경우만 처리
      if (participatedDates.size > 0) {
        if (participantMap.has(key)) {
          // 기존 참여자의 참여 일자에 추가
          const existingRecord = participantMap.get(key)!;
          participatedDates.forEach(date => existingRecord.participatedDates.add(date));
        } else {
          // 새 참여자 추가
          participantMap.set(key, {
            name,
            gender,
            congregation,
            birthYear,
            age,
            marriage,
            participatedDates
          });
        }
      }
    }
    
    // 참여자 객체 배열 생성
    const participants: Participant[] = [];
    
    participantMap.forEach((info) => {
      const participationDates = Array.from(info.participatedDates).join(',');
      
      participants.push({
        name: info.name,
        gender: info.gender,
        age: info.age,
        marriage: info.marriage,
        congregation: info.congregation,
        count: info.participatedDates.size,
        participationDates
      });
    });
    
    console.log(`엑셀에서 변환된 총 참여자 수: ${participants.length}명`);
    // 참여자 데이터 샘플 출력
    if (participants.length > 0) {
      console.log('첫 번째 참여자 예시:', participants[0]);
      
      // 참여 날짜별 참여자 수 카운팅
      const dateCountMap = new Map<string, number>();
      participants.forEach(p => {
        p.participationDates.split(',').forEach(date => {
          const d = date.trim();
          if (d) {
            dateCountMap.set(d, (dateCountMap.get(d) || 0) + 1);
          }
        });
      });
      
      console.log('날짜별 참여자 수:');
      dateCountMap.forEach((count, date) => {
        console.log(`${date}: ${count}명`);
      });
    }
    
    return participants;
  } catch (error) {
    console.error('엑셀 파일 변환 오류:', error);
    console.error('오류 상세 내용:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('스택 트레이스:', error.stack);
    }
    return [];
  }
}

// 워크시트에서 문자열 값 가져오기
function getString(worksheet: XLSX.WorkSheet, cellAddress: string): string {
  const cell = worksheet[cellAddress];
  return cell && cell.v ? String(cell.v).trim() : '';
}

// 워크시트에서 숫자 값 가져오기
function getNumber(worksheet: XLSX.WorkSheet, cellAddress: string): number {
  const cell = worksheet[cellAddress];
  if (!cell) return 0;
  
  // 셀 값이 숫자인 경우
  if (typeof cell.v === 'number') {
    return cell.v;
  }
  
  // 셀 값이 문자열인 경우 숫자로 변환 시도
  const num = Number(cell.v);
  return isNaN(num) ? 0 : num;
}

/**
 * 파일 형식에 따라 적절한 로더를 선택합니다.
 * @param filePath 파일 경로
 * @returns 참여자 데이터 객체
 */
export async function readExcelFile(filePath: string): Promise<Participant[]> {
  try {
    console.log('파일 로딩 시작:', filePath);
    
    // 파일 확장자 확인
    if (filePath.toLowerCase().endsWith('.csv')) {
      console.log('CSV 파일을 로드합니다.');
      return readCsvFile(filePath);
    } else if (filePath.toLowerCase().endsWith('.xlsx')) {
      console.log('엑셀 파일을 CSV 형식으로 변환합니다.');
      return convertExcelToCsvFormat(filePath);
    } else {
      console.error('지원되지 않는 파일 형식입니다.');
      return [];
    }
  } catch (error) {
    console.error('파일 읽기 오류:', error);
    return [];
  }
}

/**
 * 참여자 데이터를 날짜별로 그룹화합니다.
 * @param participants 참여자 목록
 * @returns 날짜별 참여자 데이터
 */
export function groupParticipantsByDate(participants: Participant[]): Record<string, Participant[]> {
  const participantsByDate: Record<string, Participant[]> = {};
  
  console.log('날짜별 그룹화 시작:', participants.length, '명의 참여자');
  
  // 캠페인 기간 내 날짜 미리 초기화
  const validDates = [
    '4월 21일', '4월 22일', '4월 23일', '4월 24일', '4월 25일', '4월 26일', '4월 27일',
    '4월 28일', '4월 29일', '4월 30일', '5월 1일', '5월 2일', '5월 3일', '5월 4일',
    '5월 5일', '5월 6일', '5월 7일', '5월 8일', '5월 9일', '5월 10일', '5월 11일', 
    '5월 12일', '5월 13일', '5월 14일', '5월 15일', '5월 16일', '5월 17일', '5월 18일'
  ];
  
  // 모든 유효 날짜를 미리 빈 배열로 초기화
  validDates.forEach(date => {
    participantsByDate[date] = [];
  });
  
  // 각 참여자별로 모든 참여 일자를 확인
  participants.forEach(participant => {
    // 참여 일자가 없으면 스킵
    if (!participant.participationDates) return;
    
    // 참여 일자는 이미 쉼표로 구분된 형식으로 저장되어 있음
    const dates = participant.participationDates
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0); // 빈 문자열 제거
    
    console.log(`참여자 ${participant.name}의 참여 일자:`, dates);
    
    dates.forEach(date => {
      // 날짜 형식 표준화 - 모든 날짜가 '4월 21일' 형식인지 확인
      let standardDate = date;
      
      // 다른 형식의 날짜를 표준 형식으로 변환
      if (date.includes('/')) {
        const [month, day] = date.split('/').map(Number);
        standardDate = `${month}월 ${day}일`;
      } else if (date.includes('-')) {
        const [month, day] = date.split('-').map(Number);
        standardDate = `${month}월 ${day}일`;
      }
      
      // 표준화된 날짜가 유효한지 확인
      if (validDates.includes(standardDate)) {
        if (!participantsByDate[standardDate]) {
          participantsByDate[standardDate] = [];
        }
        
        // 중복 참여자 방지 (같은 날짜에 동일 참여자가 중복으로 표시되지 않도록)
        const isDuplicate = participantsByDate[standardDate].some(
          p => p.name === participant.name && p.congregation === participant.congregation
        );
        
        if (!isDuplicate) {
          participantsByDate[standardDate].push(participant);
        }
      }
    });
  });
  
  console.log('날짜별 그룹화 완료. 날짜 수:', Object.keys(participantsByDate).length);
  Object.keys(participantsByDate).forEach(date => {
    console.log(`${date}: ${participantsByDate[date].length}명`);
  });
  
  return participantsByDate;
}

/**
 * 날짜를 기간(4/21 ~ 5/18) 내의 날짜로 제한합니다.
 * @param participantsByDate 날짜별 참여자 데이터
 * @returns 필터링된 날짜별 참여자 데이터
 */
export function filterDatesInCampaignPeriod(participantsByDate: Record<string, Participant[]>): Record<string, Participant[]> {
  const filteredData: Record<string, Participant[]> = {};
  const validDates = [
    '4월 21일', '4월 22일', '4월 23일', '4월 24일', '4월 25일', '4월 26일', '4월 27일',
    '4월 28일', '4월 29일', '4월 30일', '5월 1일', '5월 2일', '5월 3일', '5월 4일',
    '5월 5일', '5월 6일', '5월 7일', '5월 8일', '5월 9일', '5월 10일', '5월 11일', 
    '5월 12일', '5월 13일', '5월 14일', '5월 15일', '5월 16일', '5월 17일', '5월 18일'
  ];
  
  console.log('필터링 전 날짜 목록:', Object.keys(participantsByDate));
  
  validDates.forEach(date => {
    filteredData[date] = participantsByDate[date] || [];
  });
  
  // 최종 결과 디버깅
  console.log('필터링 후 최종 날짜별 참여자 수:');
  validDates.forEach(date => {
    console.log(`${date}: ${filteredData[date]?.length || 0}명`);
  });
  
  return filteredData;
} 