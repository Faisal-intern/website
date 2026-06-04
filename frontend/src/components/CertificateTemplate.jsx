import React from 'react';

const CertificateTemplate = ({ certificateData }) => {
  const {
    rollNo,
    enrolmentNo,
    courseNameHindi,
    courseNameEnglish,
    courseYearHindi,
    courseYearEnglish,
    candidateNameHindi,
    fatherNameHindi,
    candidateNameEnglish,
    fatherNameEnglish,
    durationHindi,
    durationEnglish,
    modeHindi,
    modeEnglish,
    iaSubCode,
    meSubCode,
    iaMaxMarks,
    meMaxMarks,
    maxMarks,
    iaMarks,
    meMarks,
    marksTotal,
    resultRemarkHindi,
    resultRemarkEnglish,
    dateOfResultHindi,
    dateOfResultEnglish,
    certificateNo,
  } = certificateData || {};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap');

        .cert-page {
          width: 210mm;
          height: auto;
          margin: 0 auto;
          background: white;
          box-sizing: border-box;
          padding: 0;
          position: relative;
          font-family: 'Arial', sans-serif;
        }

        .cert-inner {
          width: 100%;
          height: auto;
          box-sizing: border-box;
          padding: 12mm 14mm 10mm 14mm;
          position: relative;
          background-image: url('/certificate-bg.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          display: flex;
          flex-direction: column;
        }

        .cert-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 4mm;
        }

        .cert-header-left {
          width: 55mm;
          display: flex;
          flex-direction: column;
          gap: 1mm;
        }

        .cert-header-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2mm;
        }

        .cert-logo {
          width: 22mm;
          height: 22mm;
          object-fit: contain;
        }

        .cert-header-right {
          width: 55mm;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1mm;
        }

        .font-kokila { font-family: 'Kokila', 'Noto Sans Devanagari', serif; }
        .font-tahoma { font-family: 'Tahoma', 'Arial', sans-serif; }
        .font-arya { font-family: 'Arya', 'Noto Sans Devanagari', sans-serif; }
        .font-old-english { font-family: 'EB Garamond', 'Times New Roman', serif; }

        .cert-institute-title {
          text-align: center;
          margin-bottom: 4mm;
          line-height: 1.3;
        }

        .cert-divider {
          width: 100%;
          border: none;
          border-top: 1.5px solid #333;
          margin: 1.5mm 0;
        }

        .cert-section-title {
          text-align: center;
          margin-bottom: 3mm;
        }

        .cert-body-text {
          text-align: center;
          margin-bottom: 2mm;
          line-height: 1.5;
        }

        .cert-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .cert-table th,
        .cert-table td {
          border: 1.5px solid #000;
          padding: 3px 6px;
          text-align: center;
          vertical-align: middle;
        }

        .cert-table th {
          background-color: #f0f0f0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          line-height: 1.4;
        }

        .cert-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: auto;
          padding-top: 4mm;
        }

        .cert-sig-block {
          text-align: center;
          width: 50mm;
        }

        .cert-sig-img-wrap {
          height: 14mm;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          margin-bottom: 1mm;
        }

        .cert-date-block {
          text-align: center;
          background: #dbeafe;
          padding: 3mm 5mm;
          width: 50mm;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .cert-disclaimer {
          font-size: 9px;
          color: #888;
          text-align: center;
          margin-top: 3mm;
          line-height: 1.4;
        }

        .cert-no {
          font-size: 9px;
          color: #aaa;
          text-align: center;
          margin-top: 1mm;
          font-weight: bold;
          letter-spacing: 0.5px;
        }

        .inline-divider {
          width: 100%;
          border-bottom: 1.5px solid #000;
          margin: 1mm 0;
        }

        .course-meta {
          font-size: 12px;
          margin-bottom: 4mm;
        }

        .course-meta-row {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0 8mm;
          margin-bottom: 1mm;
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
          }
          .cert-page {
            margin: 0;
            box-shadow: none;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="cert-page">
        <div className="cert-inner">

          {/* ── HEADER ── */}
          <div className="cert-header">

            {/* Left: Enrollment */}
            <div className="cert-header-left">
              <div className="font-kokila" style={{ fontSize: '17px' }}>नामांकन संख्या</div>
              <div className="font-tahoma" style={{ fontSize: '13px' }}>Enrollment No. {enrolmentNo}</div>
            </div>

            {/* Center: Logo + Institute Name */}
            <div className="cert-header-center">
              <img src="/VMI Logo.png" alt="VMI Logo" className="cert-logo" />
            </div>

            {/* Right: Roll No */}
            <div className="cert-header-right">
              <div className="font-kokila" style={{ fontSize: '17px' }}>अनुक्रमांक</div>
              <div className="font-tahoma" style={{ fontSize: '13px' }}>Roll No. {rollNo}</div>
            </div>
          </div>

          {/* ── INSTITUTE TITLE ── */}
          <div className="cert-institute-title">
            <div className="font-arya" style={{ fontSize: '17px', marginBottom: '1mm' }}>
              वराहमिहिर बहुविषयक संस्थान
            </div>
            <div className="font-old-english" style={{ fontSize: '18px', fontWeight: '600' }}>
              Varahamihira Multidisciplinary Institute
            </div>
          </div>

          {/* ── CERTIFICATE TITLE ── */}
          <div className="cert-section-title" style={{ marginBottom: '4mm' }}>
            <span className="font-kokila" style={{ fontSize: '18px' }}>{courseNameHindi} प्रमाणपत्र</span>
            <span style={{ margin: '0 6px' }}>✱</span>
            <span className="font-tahoma" style={{ fontSize: '13px' }}>
              CERTIFICATE IN {courseNameEnglish?.toUpperCase()}
            </span>
          </div>

          {/* ── CERTIFICATE BODY TEXT ── */}
          <div className="cert-body-text">
            <p className="font-kokila" style={{ fontSize: '20px', marginBottom: '2mm' }}>
              प्रमाणित किया जाता है कि सन् {courseYearHindi} में परीक्षा के उपरांत{' '}
              <b>{courseNameHindi}</b> की प्रमाणपत्र के योग्य सिद्ध होने पर
            </p>

            <div className="font-kokila" style={{ fontSize: '18px', marginBottom: '1mm' }}>
              <b className="font-arya" style={{ fontSize: '16px' }}>{candidateNameHindi}</b>
              {' '}सुपुत्र/सुपुत्री{' '}
              <b className="font-arya" style={{ fontSize: '16px' }}>{fatherNameHindi}</b>
            </div>
            <div className="inline-divider" />

            <p className="font-kokila" style={{ fontSize: '16px', margin: '1.5mm 0' }}>
              को {courseYearHindi} के संगोष्ठी में उक्त प्रमाणपत्र प्रदान की गई ।
            </p>

            <div style={{ margin: '2mm 0', fontSize: '13px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
              This is to certify that having been examined in <b>{courseYearEnglish}</b> and found
              qualified for the certificate in{' '}
              <span style={{ fontWeight: '600' }}>{courseNameEnglish}</span>
              <br />
              <strong>{candidateNameEnglish}</strong> d/o/s/o{' '}
              <strong>{fatherNameEnglish}</strong>
              <div className="inline-divider" />
              was awarded the said certificate at the conclave held in {courseYearEnglish}.
            </div>
          </div>

          {/* ── COURSE DETAILS ── */}
          <div style={{ marginBottom: '3mm' }}>
            <div className="cert-section-title" style={{ marginBottom: '2mm', fontSize: '13px' }}>
              <span className="font-kokila" style={{ fontSize: '18px' }}>पाठ्यक्रम और अंक विवरण</span>
              <span style={{ margin: '0 6px' }}>✱</span>
              <span className="font-tahoma">Course and Marks Description</span>
            </div>

            <div className="course-meta">
              <div className="course-meta-row">
                <div>
                  <span className="font-kokila" style={{ fontSize: '15px' }}>पाठ्यक्रम की अवधि</span>
                  <span className="font-tahoma"> / Duration of the Course: </span>
                </div>
                <div>
                  <span className="font-kokila" style={{ fontSize: '15px' }}>{durationHindi}</span>
                  <span className="font-tahoma"> / {durationEnglish}</span>
                </div>
              </div>
              <div className="course-meta-row">
                <div>
                  <span className="font-kokila" style={{ fontSize: '15px' }}>शिक्षण विधि</span>
                  <span className="font-tahoma"> / Mode of Teaching: </span>
                </div>
                <div>
                  <span className="font-kokila" style={{ fontSize: '15px' }}>{modeHindi}</span>
                  <span className="font-tahoma"> / {modeEnglish}</span>
                </div>
              </div>
            </div>

            <table className="cert-table">
              <thead>
                <tr>
                  <th className="font-kokila">क्रमांक<br /><span className="font-tahoma" style={{ fontSize: '11px' }}>Sr. No.</span></th>
                  <th className="font-kokila">परीक्षा पत्र<br /><span className="font-tahoma" style={{ fontSize: '11px' }}>Papers</span></th>
                  <th className="font-kokila">विषय कोड<br /><span className="font-tahoma" style={{ fontSize: '11px' }}>Subject Code</span></th>
                  <th className="font-kokila">पूर्णांक<br /><span className="font-tahoma" style={{ fontSize: '11px' }}>Total Marks</span></th>
                  <th className="font-kokila">प्राप्तांक<br /><span className="font-tahoma" style={{ fontSize: '11px' }}>Obtained Marks</span></th>
                  <th className="font-kokila">परिणाम का विवरण<br /><span className="font-tahoma" style={{ fontSize: '11px' }}>Details of Result</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1.</td>
                  <td style={{ textAlign: 'left', paddingLeft: '6px' }}>
                    <span className="font-kokila" style={{ fontSize: '13px' }}>आंतरिक मूल्यांकन</span>
                    <br />
                    <span className="font-tahoma" style={{ fontSize: '11px' }}>Internal Assessment</span>
                  </td>
                  <td>{iaSubCode}</td>
                  <td>{iaMaxMarks}</td>
                  <td>{iaMarks}</td>
                  <td rowSpan={2} style={{ verticalAlign: 'middle' }}>
                    <span className="font-kokila" style={{ fontSize: '13px' }}>{resultRemarkHindi}</span>
                    <br />
                    <span className="font-tahoma" style={{ fontSize: '11px' }}>{resultRemarkEnglish}</span>
                  </td>
                </tr>
                <tr>
                  <td>2.</td>
                  <td style={{ textAlign: 'left', paddingLeft: '6px' }}>
                    <span className="font-kokila" style={{ fontSize: '13px' }}>मुख्य परीक्षा</span>
                    <br />
                    <span className="font-tahoma" style={{ fontSize: '11px' }}>Main Examination</span>
                  </td>
                  <td>{meSubCode}</td>
                  <td>{meMaxMarks}</td>
                  <td>{meMarks}</td>
                </tr>
                <tr style={{ fontWeight: 'bold' }}>
                  <td colSpan={3}>
                    <span className="font-kokila" style={{ fontSize: '13px' }}>योग:</span>
                    <br />
                    <span className="font-tahoma" style={{ fontSize: '11px' }}>Total:</span>
                  </td>
                  <td>{maxMarks}</td>
                  <td>{marksTotal}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── FOOTER SIGNATURES ── */}
          <div className="cert-footer">

            {/* Controller of Examination */}
            <div className="cert-sig-block">
              <div className="cert-sig-img-wrap">
                <img src="/Signature.png" alt="Controller Signature" style={{ height: '12mm', objectFit: 'contain' }} />
              </div>
              <hr className="cert-divider" />
              <div className="font-kokila" style={{ fontSize: '17px' }}>परीक्षा नियंत्रक</div>
              <div className="font-tahoma" style={{ fontSize: '12px' }}>Controller of Examination</div>
            </div>

            {/* Date */}
            <div className="cert-date-block">
              <div className="font-kokila" style={{ fontSize: '16px' }}>दिल्ली, दिनांक {dateOfResultHindi}</div>
              <div className="font-tahoma" style={{ fontSize: '12px' }}>Delhi, Dated the {dateOfResultEnglish}</div>
            </div>

            {/* OSD Examination */}
            <div className="cert-sig-block">
              <div className="cert-sig-img-wrap">
                <img src="/BKG Signature.png" alt="OSD Examination" style={{ height: '18mm', objectFit: 'contain', marginBottom: '-4mm' }} />
              </div>
              <hr className="cert-divider" />
              <div className="font-kokila" style={{ fontSize: '17px' }}>वि.क.अ. (परीक्षा)</div>
              <div className="font-tahoma" style={{ fontSize: '12px' }}>OSD (Examination)</div>
            </div>
          </div>

          {/* ── CERTIFICATE NO + DISCLAIMER ── */}
          {certificateNo && (
            <div className="cert-no">Certificate No. {certificateNo}</div>
          )}
          <div className="cert-disclaimer">
            (यह प्रमाणपत्र डिजिटल रूप से जारी किया गया है और संस्थान के होलोग्राम के बिना इसका प्रिंट अमान्य है
            / This certificate is digitally issued and printing it is invalid without the Institute hologram.)
          </div>

        </div>
      </div>
    </>
  );
};

export default CertificateTemplate;
