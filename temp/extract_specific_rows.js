const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// 파일 경로 설정
const excelFilePath = path.join(__dirname, '..', 'public', 'data', '서울성수.xlsx');
const outputFilePath = path.join(__dirname, '..', 'public', 'data', 'specific_participants.csv');

// 현재 연도 설정 (나이 계산용)
const currentYear = new Date().getFullYear();

// UTF-8 BOM으로 저장 (한글 인코딩 문제 해결)
const writeCsvWithBOM = (filePath, content) => {
  const BOM = '\ufeff';
  fs.writeFileSync(filePath, BOM + content, 'utf8');
};

// 엑셀 파일 로드
console.log('엑셀 파일 로드 중...');
const workbook = xlsx.readFile(excelFilePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// 열 매핑 (README.md 파일의 규칙에 따라)
const COLUMN_MAPPING = {
  NAME: 'C',        // 이름
  GENDER: 'D',      // 성별
  CONGREGATION: 'E', // 회중
  BIRTH_YEAR: 'F',  // 출생연도
  MARRIAGE: 'H'     // 결혼
};

// 참여 일정 열 범위 (K~AI)
const DATE_COLUMNS_START = 'K';
const DATE_COLUMNS_END = 'AI';

// 날짜 추출 함수
function extractDates(worksheet, rowIndex) {
  const dates = [];
  const datesWithColumns = []; // 날짜와 컬럼 정보를 함께 저장
  
  // 첫 번째 행에서 날짜 정보 가져오기
  for (let colIndex = xlsx.utils.decode_col(DATE_COLUMNS_START); 
       colIndex <= xlsx.utils.decode_col(DATE_COLUMNS_END); 
       colIndex++) {
    
    const cellAddress = xlsx.utils.encode_cell({ r: 0, c: colIndex });
    const dateCell = worksheet[cellAddress];
    
    if (dateCell && dateCell.v) {
      const date = dateCell.v.toString().trim();
      
      // 해당 날짜의 참여 여부 확인
      const participationCellAddress = xlsx.utils.encode_cell({ r: rowIndex, c: colIndex });
      const participationCell = worksheet[participationCellAddress];
      
      if (participationCell && participationCell.v === 'O') {
        dates.push(date);
        datesWithColumns.push({ date, colIndex });
      }
    }
  }
  
  return { 
    dates, 
    datesWithColumns // 날짜별 컬럼 인덱스 정보 포함
  };
}

// 참가자 정보 추출 함수
function extractParticipantData(name) {
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  
  for (let rowIndex = 1; rowIndex <= range.e.r; rowIndex++) {
    const nameCell = worksheet[`${COLUMN_MAPPING.NAME}${rowIndex + 1}`];
    
    if (nameCell && nameCell.v === name) {
      // 참가자 정보 추출
      const gender = worksheet[`${COLUMN_MAPPING.GENDER}${rowIndex + 1}`]?.v || '';
      const congregation = worksheet[`${COLUMN_MAPPING.CONGREGATION}${rowIndex + 1}`]?.v || '';
      const birthYear = worksheet[`${COLUMN_MAPPING.BIRTH_YEAR}${rowIndex + 1}`]?.v || '';
      const marriage = worksheet[`${COLUMN_MAPPING.MARRIAGE}${rowIndex + 1}`]?.v || '';
      
      // 나이 계산
      const age = birthYear ? currentYear - parseInt(birthYear, 10) : '';
      
      // 참여 날짜 정보 추출
      const { dates, datesWithColumns } = extractDates(worksheet, rowIndex);
      
      // 첫 날짜 확인 (컬럼 순으로 정렬하여 엑셀에 기록된 첫 참여 날짜 찾기)
      const sortedDates = [...datesWithColumns].sort((a, b) => a.colIndex - b.colIndex);
      const firstDate = sortedDates.length > 0 ? sortedDates[0].date : '';
      
      return {
        name,
        gender,
        congregation,
        age,
        birthYear,
        marriage,
        participationDates: dates,
        firstDate // 정렬된 첫 참여 날짜
      };
    }
  }
  
  return null;
}

// 메인 함수: 특정 참가자 데이터 추출 및 CSV 생성
function extractSpecificParticipants() {
  console.log('특정 참가자 데이터 추출 중...');
  
  const targetNames = ['차지환', '유준상'];
  let csvContent = '날짜,회중,이름,성별,나이,출생연도,결혼,참여일자\n';
  
  targetNames.forEach(name => {
    const participantData = extractParticipantData(name);
    
    if (participantData) {
      console.log(`${name} 참가자 정보 추출 완료`);
      
      // 모든 참여일자를 쉼표로 구분하여 합침
      const allDates = participantData.participationDates.join(',');
      
      // CSV 행 추가
      csvContent += `${participantData.firstDate},${participantData.congregation},${participantData.name},${participantData.gender},${participantData.age},${participantData.birthYear},${participantData.marriage},"${allDates}"\n`;
    } else {
      console.log(`${name} 참가자 정보를 찾을 수 없습니다.`);
    }
  });
  
  // CSV 파일 저장
  writeCsvWithBOM(outputFilePath, csvContent);
  console.log(`${outputFilePath} 파일 저장 완료`);
}

// 스크립트 실행
try {
  extractSpecificParticipants();
  console.log('처리 완료!');
} catch (error) {
  console.error('오류 발생:', error);
} 