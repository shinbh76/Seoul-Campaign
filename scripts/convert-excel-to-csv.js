const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// 엑셀 파일 경로 및 CSV 저장 경로 설정
const excelFilePath = path.join(__dirname, '..', 'public', '서울성수.xlsx');
const csvOutputPath = path.join(__dirname, '..', 'public', 'data', 'participants.csv');

// 컬럼 인덱스 매핑 (0부터 시작)
const COLUMN_INDICES = {
  NAME: 2,        // C열 = 이름
  GENDER: 3,      // D열 = 성별
  CONGREGATION: 4, // E열 = 회중
  BIRTH_YEAR: 5,  // F열 = 출생연도
  MARRIAGE: 7,    // H열 = 결혼
  FIRST_DATE: 10  // K열 = 첫 번째 참여 일자 열
};

// 엑셀 파일 읽기
const workbook = xlsx.readFile(excelFilePath);

// 첫 번째 시트 가져오기
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 엑셀 데이터를 JS 객체로 변환
const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// 헤더 행 (첫 번째 행) 가져오기
const headers = rawData[0];

// 참여 날짜 컬럼 찾기 (K열부터 AI열)
const dateColumns = [];
for (let i = COLUMN_INDICES.FIRST_DATE; i < headers.length; i++) {
  const header = headers[i];
  if (header.includes('월') && header.includes('일')) {
    // 원본 헤더에서 요일과 괄호 부분을 제거 (예: "4월 22일 화요일" -> "4월 22일")
    const cleanDateStr = removeWeekday(header);
    dateColumns.push({ index: i, name: cleanDateStr, originalHeader: header });
  }
}

// 중복 참여자 처리를 위한 맵
const uniqueParticipantsMap = new Map();

// 요일 제거 함수 - "4월 25일 금요일" -> "4월 25일" 또는 "5월 1일 목요일 (근로자의 날)" -> "5월 1일"
function removeWeekday(dateStr) {
  // 요일과 괄호 내용 제거
  return dateStr.replace(/\s*\([^)]*\)\s*/, '').replace(/\s*[월화수목금토일]요일.*/, '');
}

// 참여자 데이터 추출 및 중복 처리
for (let rowIndex = 1; rowIndex < rawData.length; rowIndex++) {
  const row = rawData[rowIndex];
  
  // 이름 필드가 비어있으면 건너뜀
  if (!row[COLUMN_INDICES.NAME]) continue;
  
  // 필요한 데이터 추출
  const name = row[COLUMN_INDICES.NAME] || '';
  const gender = row[COLUMN_INDICES.GENDER] || '';
  const congregation = row[COLUMN_INDICES.CONGREGATION] || '';
  const birthYear = row[COLUMN_INDICES.BIRTH_YEAR] || '';
  const marriage = row[COLUMN_INDICES.MARRIAGE] || '';
  
  // 참여 날짜 확인
  const participationDates = [];
  for (const dateCol of dateColumns) {
    if (row[dateCol.index] === 'O' || row[dateCol.index] === 'o') {
      // 요일이 제거된 깨끗한 날짜 형식 사용
      participationDates.push(dateCol.name);
    }
  }
  
  // 중복 참여자 식별을 위한 키 생성
  const uniqueKey = `${name}_${gender}_${congregation}_${birthYear}`;
  
  if (uniqueParticipantsMap.has(uniqueKey)) {
    // 기존 참여자의 참여 날짜에 새로운 날짜 추가 (중복 없이)
    const existingParticipant = uniqueParticipantsMap.get(uniqueKey);
    for (const date of participationDates) {
      if (!existingParticipant.participationDates.includes(date)) {
        existingParticipant.participationDates.push(date);
      }
    }
  } else {
    // 새 참여자 추가
    uniqueParticipantsMap.set(uniqueKey, {
      name,
      gender,
      congregation,
      birthYear,
      marriage,
      participationDates,
      firstDate: participationDates.length > 0 ? participationDates[0] : null // 첫 번째 참여 날짜 저장
    });
  }
}

// CSV 파일에 사용할 헤더 설정
const csvHeaders = ['날짜', '회중', '이름', '성별', '나이', '출생연도', '결혼', '참여일자'];
let csvRows = [csvHeaders.join(',')];

// 현재 연도 가져오기
const currentYear = new Date().getFullYear();

// 고유 참여자 데이터를 CSV 행으로 변환 - 각 참여자당 하나의 행만 생성
uniqueParticipantsMap.forEach(participant => {
  // 참여일자가 없는 경우 건너뜀
  if (!participant.participationDates.length) return;

  // 나이 계산
  const age = participant.birthYear ? currentYear - participant.birthYear : '';
  
  // 이름과 성별 처리
  const name = participant.name.replace(/자매$/, '').replace(/형제$/, '').trim();
  const gender = participant.gender || '';
  
  // 각 참여자당 하나의 행만 생성 (첫 번째 참여 날짜 사용)
  const firstDate = participant.firstDate;
  
  const csvRow = [
    firstDate,                                   // 첫 번째 참여 날짜
    participant.congregation,                    // 회중
    name,                                        // 이름
    gender,                                      // 성별
    age,                                         // 나이
    participant.birthYear,                       // 출생연도
    participant.marriage,                        // 결혼
    participant.participationDates.join(',')     // 모든 참여 날짜
  ];
  
  // CSV 행으로 변환 (쉼표를 포함한 필드는 따옴표로 감싸기)
  const formattedRow = csvRow.map(field => {
    if (typeof field === 'string' && field.includes(',')) {
      return `"${field}"`;
    }
    return field;
  }).join(',');
  
  csvRows.push(formattedRow);
});

// CSV 파일 저장
const csvContent = csvRows.join('\n');
fs.writeFileSync(csvOutputPath, csvContent);

// 통계 정보 출력
console.log(`엑셀 파일이 성공적으로 CSV로 변환되었습니다: ${csvOutputPath}`);
console.log(`총 고유 참여자 수: ${uniqueParticipantsMap.size}명`);

// 날짜별 참여자 수 출력
const dateParticipantCounts = {};
uniqueParticipantsMap.forEach(participant => {
  participant.participationDates.forEach(date => {
    dateParticipantCounts[date] = (dateParticipantCounts[date] || 0) + 1;
  });
});

console.log('\n날짜별 참여자 수:');
Object.keys(dateParticipantCounts).sort().forEach(date => {
  console.log(`${date}: ${dateParticipantCounts[date]}명`);
}); 