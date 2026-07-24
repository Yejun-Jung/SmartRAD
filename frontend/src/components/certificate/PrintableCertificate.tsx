"use client";

import { certificateTypeLabel } from "./types";

export interface PrintableCertificateData {
  certificateType: string;
  employeeName: string;
  birthDate: string | null;
  address: string | null;
  departmentName: string | null;
  positionName: string | null;
  hireDate: string | null;
  resignationDate: string | null;
  purpose: string | null;
  issueDate: string;
  issueNumber: string;
}

interface Props {
  data: PrintableCertificateData | null;
}

export default function PrintableCertificate({ data }: Props) {
  if (!data) return null;

  const title = certificateTypeLabel(data.certificateType);
  
  // 날짜 포맷 (YYYY년 MM월 DD일)
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const periodString = data.resignationDate
    ? `${formatDate(data.hireDate)} ~ ${formatDate(data.resignationDate)}`
    : `${formatDate(data.hireDate)} ~ 현재`;

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-certificate, #printable-certificate * {
              visibility: visible;
            }
            #printable-certificate {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
      <div id="printable-certificate" className="hidden print:flex bg-white text-black flex-col items-center justify-start pt-20 pb-20 w-[210mm] min-h-[297mm] mx-auto z-[9999]">
        {/* 발급번호 */}
      <div className="w-full text-right px-16 mb-12">
        <span className="text-sm font-medium tracking-wide">제 {data.issueNumber} 호</span>
      </div>

      {/* 제목 */}
      <h1 className="text-[42px] font-black tracking-[1.5em] ml-[1.5em] mb-20 text-center w-full">
        {title}
      </h1>

      {/* 인적사항 테이블 */}
      <div className="w-full px-16 mb-8">
        <table className="w-full border-collapse border-2 border-black text-lg">
          <tbody>
            <tr>
              <th className="border border-black bg-gray-50/50 py-3 px-4 w-32 font-bold text-center">성 명</th>
              <td className="border border-black py-3 px-4 text-center">{data.employeeName}</td>
              <th className="border border-black bg-gray-50/50 py-3 px-4 w-32 font-bold text-center">생년월일</th>
              <td className="border border-black py-3 px-4 text-center">{formatDate(data.birthDate)}</td>
            </tr>
            <tr>
              <th className="border border-black bg-gray-50/50 py-3 px-4 font-bold text-center">주 소</th>
              <td colSpan={3} className="border border-black py-3 px-4">{data.address || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 재직사항 테이블 */}
      <div className="w-full px-16 mb-8">
        <table className="w-full border-collapse border-2 border-black text-lg">
          <tbody>
            <tr>
              <th className="border border-black bg-gray-50/50 py-3 px-4 w-32 font-bold text-center">소 속</th>
              <td className="border border-black py-3 px-4 text-center">{data.departmentName || ''}</td>
              <th className="border border-black bg-gray-50/50 py-3 px-4 w-32 font-bold text-center">직 위</th>
              <td className="border border-black py-3 px-4 text-center">{data.positionName || ''}</td>
            </tr>
            <tr>
              <th className="border border-black bg-gray-50/50 py-3 px-4 font-bold text-center">재직기간</th>
              <td colSpan={3} className="border border-black py-3 px-4 text-center">{periodString}</td>
            </tr>
            <tr>
              <th className="border border-black bg-gray-50/50 py-3 px-4 font-bold text-center">용 도</th>
              <td colSpan={3} className="border border-black py-3 px-4 text-center">{data.purpose || '제출용'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 본문 텍스트 */}
      <div className="w-full px-16 mt-16 mb-32">
        <p className="text-2xl font-bold text-center tracking-widest leading-loose">
          위와 같이 {data.certificateType === 'EMPLOYMENT' ? '재직하고' : '근무하였'}음을 증명합니다.
        </p>
      </div>

      {/* 발급일자 */}
      <div className="w-full px-16 mt-auto mb-16 text-center text-xl tracking-widest font-bold">
        {formatDate(data.issueDate)}
      </div>

      {/* 회사명 및 직인 */}
      <div className="w-full px-16 text-center relative flex justify-center items-center h-32">
        <h2 className="text-4xl font-bold tracking-[0.5em] mr-8">(주) 스마트래드 대표이사</h2>
        {/* CSS로 구현한 직인 모양 */}
        <div className="w-24 h-24 border-[4px] border-red-600 rounded-full flex items-center justify-center text-red-600 absolute right-24 shadow-sm" style={{ transform: 'rotate(-5deg)' }}>
          <span className="font-serif font-black text-3xl tracking-tighter" style={{ fontFamily: '"Gothic A1", "Nanum Myeongjo", serif' }}>직인<br/>생략</span>
        </div>
      </div>
    </div>
    </>
  );
}
