import { useState, useEffect } from 'react';
import { Participant, ChartDataItem, CalendarItem } from '../models/Participant';
import { readExcelFile, groupParticipantsByDate, filterDatesInCampaignPeriod } from '../services/excelDataService';
import * as dataAnalysisService from '../services/dataAnalysisService';

interface ParticipantsDataHook {
  loading: boolean;
  error: string | null;
  allParticipants: Participant[];
  participantsByDate: Record<string, Participant[]>;
  genderData: ChartDataItem[];
  ageData: ChartDataItem[];
  marriageData: ChartDataItem[];
  participationData: ChartDataItem[];
  congregationData: ChartDataItem[];
  regionData: ChartDataItem[];
  calendarData: CalendarItem[];
  averageAge: string;
  totalParticipants: number;
  maxParticipantsDates: {
    maxDates: string[];
    maxCount: number;
  };
}

/**
 * 참여자 데이터를 로드하고 관리하는 커스텀 훅
 * @param filePath 데이터 파일 경로
 * @returns 참여자 데이터 및 분석 결과
 */
export function useParticipantsData(filePath: string): ParticipantsDataHook {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [participantsByDate, setParticipantsByDate] = useState<Record<string, Participant[]>>({});
  
  // 분석 데이터
  const [genderData, setGenderData] = useState<ChartDataItem[]>([]);
  const [ageData, setAgeData] = useState<ChartDataItem[]>([]);
  const [marriageData, setMarriageData] = useState<ChartDataItem[]>([]);
  const [participationData, setParticipationData] = useState<ChartDataItem[]>([]);
  const [congregationData, setCongregationData] = useState<ChartDataItem[]>([]);
  const [regionData, setRegionData] = useState<ChartDataItem[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarItem[]>([]);
  const [averageAge, setAverageAge] = useState<string>("0");
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [maxParticipantsDates, setMaxParticipantsDates] = useState<{ maxDates: string[], maxCount: number }>({
    maxDates: [],
    maxCount: 0
  });
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // 엑셀 파일에서 데이터 로드
        const participants = await readExcelFile(filePath);
        
        if (participants.length === 0) {
          setError('참여자 데이터를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }
        
        // 참여자 데이터 설정
        setAllParticipants(participants);
        
        // 날짜별로 참여자 그룹화
        const participantsByDateRaw = groupParticipantsByDate(participants);
        
        // 캠페인 기간 내 날짜만 필터링
        const filteredParticipantsByDate = filterDatesInCampaignPeriod(participantsByDateRaw);
        setParticipantsByDate(filteredParticipantsByDate);
        
        // 통계 데이터 계산
        setGenderData(dataAnalysisService.calculateGenderData(participants));
        setAgeData(dataAnalysisService.calculateAgeData(participants));
        setMarriageData(dataAnalysisService.calculateMarriageData(participants));
        setParticipationData(dataAnalysisService.calculateParticipationData(participants));
        setCongregationData(dataAnalysisService.calculateCongregationData(participants));
        setRegionData(dataAnalysisService.calculateRegionData(participants));
        setCalendarData(dataAnalysisService.calculateCalendarData(filteredParticipantsByDate));
        setAverageAge(dataAnalysisService.calculateAverageAge(participants));
        
        // 중복 없는 참여자 수 계산
        const uniqueParticipants = Array.from(new Map(participants.map(p => [p.name, p])).values());
        setTotalParticipants(uniqueParticipants.length);
        
        // 참여자 수 최다 일자 찾기
        setMaxParticipantsDates(
          dataAnalysisService.findMaxParticipantsDates(filteredParticipantsByDate)
        );
        
        setLoading(false);
      } catch (err) {
        console.error('데이터 로딩 중 오류:', err);
        setError('데이터를 로드하는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }
    
    loadData();
  }, [filePath]);
  
  return {
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
  };
} 