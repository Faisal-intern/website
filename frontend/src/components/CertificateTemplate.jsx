import React from 'react';

const CertificateTemplate = ({ certificateData }) => {
  const {
    rollNo, enrolmentNo, courseNameHindi, courseNameEnglish,
    courseYearHindi, courseYearEnglish, candidateNameHindi, fatherNameHindi,
    candidateNameEnglish, fatherNameEnglish, durationHindi, durationEnglish,
    modeHindi, modeEnglish, iaSubCode, meSubCode, iaMaxMarks, meMaxMarks,
    maxMarks, iaMarks, meMarks, marksTotal, resultRemarkHindi, resultRemarkEnglish,
    dateOfResultHindi, dateOfResultEnglish, certificateNo,
  } = certificateData || {};

  const s = {
    page: {
      width: '794px', margin: '0 auto', background: 'white',
      boxSizing: 'border-box', padding: '0', fontFamily: 'Arial, sans-serif', overflow: 'hidden',
      WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility',
    },
    inner: {
      width: '100%', boxSizing: 'border-box', padding: '20px 44px 28px 44px',
      backgroundImage: "url('/certificate-bg.png')", backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
      display: 'flex', flexDirection: 'column',
    },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' },
    headerSide: { width: '180px', display: 'flex', flexDirection: 'column' },
    headerRight: { width: '180px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
    logo: { width: '80px', height: '80px', objectFit: 'contain' },
    kokila: { fontFamily: "'Kokila','Noto Sans Devanagari',serif", letterSpacing: '0', wordSpacing: 'normal' },
    arya: { fontFamily: "'Arya','Noto Sans Devanagari',sans-serif", letterSpacing: '0', wordSpacing: 'normal' },
    oldEng: { fontFamily: "'Old English Text MT','UnifrakturMaguntia',serif", letterSpacing: '0', fontWeight: 'bold' },
    tahoma: { fontFamily: "'Tahoma','Arial',sans-serif" },
    centerText: { textAlign: 'center' },
    divider: { width: '100%', border: 'none', borderTop: '1.5px solid #333', margin: '3px 0' },
    inlineDivider: { width: '100%', borderBottom: '1.5px solid #000', margin: '3px 0' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
    th: { border: '1px solid #000', padding: '3px 4px', textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#f0f0f0', WebkitPrintColorAdjust: 'exact' },
    td: { border: '1px solid #000', padding: '3px 4px', textAlign: 'center', verticalAlign: 'middle' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2px' },
    sigBlock: { textAlign: 'center', width: '185px' },
    sigImgWrap: { height: '44px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' },
    dateBlock: { textAlign: 'center', background: '#dbeafe', padding: '8px 10px', width: '230px', minWidth: '230px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' },
  };

  return (
    <>
      <style>{`
        @font-face { font-family: 'Old English Text MT'; src: url('/fonts/oldenglishtextmt.ttf') format('truetype'); }
        @font-face { font-family: 'Kokila'; src: url('/fonts/Kokila.ttf') format('truetype'); }
        @font-face { font-family: 'Arya'; src: url('/fonts/Arya-Bold.ttf') format('truetype'); font-weight: bold; }
        @media print { @page { size: A4; margin: 0; } }
      `}</style>

      <div style={s.page}>
        <div style={s.inner}>

          {/* HEADER */}
          <div style={s.header}>
            <div style={s.headerSide}>
              <div style={{ ...s.kokila, fontSize: '14px' }}>नामांकन संख्या</div>
              <div style={{ ...s.tahoma, fontSize: '12px' }}>Enrolment No. {enrolmentNo}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="/VMI Logo.png" alt="VMI Logo" style={s.logo} />
            </div>
            <div style={s.headerRight}>
              <div style={{ ...s.kokila, fontSize: '14px' }}>अनुक्रमांक</div>
              <div style={{ ...s.tahoma, fontSize: '12px' }}>Roll. No. {rollNo}</div>
            </div>
          </div>

          {/* INSTITUTE TITLE */}
          <div style={{ ...s.centerText, marginBottom: '4px', lineHeight: '1.25' }}>
            <div style={{ ...s.oldEng, fontSize: '26px' }}>Varāhamihira Multidisciplinary Institute</div>
            <div style={{ ...s.kokila, fontSize: '18px', marginTop: '2px' }}>वराहमिहिर बहुविषयक संस्थान</div>
          </div>

          {/* CERTIFICATE TITLE */}
          <div style={{ ...s.centerText, marginBottom: '6px' }}>
            <div style={{ ...s.kokila, fontSize: '14px' }}>{courseNameHindi} प्रमाणपत्र</div>
            <div style={{ ...s.tahoma, fontSize: '12px', marginTop: '2px', textTransform: 'uppercase' }}>{courseNameEnglish}</div>
          </div>

          {/* BODY */}
          <div style={{ ...s.centerText, lineHeight: '1.5', marginBottom: '2px' }}>
            <p style={{ ...s.kokila, fontSize: '13px', marginBottom: '2px' }}>
              प्रमाणित किया जाता है कि सन् {courseYearHindi} में परीक्षा के उपरांत{' '}
              <b>{courseNameHindi}</b> की प्रमाणपत्र के योग्य सिद्ध होने पर
            </p>
            <div style={{ ...s.kokila, fontSize: '17px', marginBottom: '2px' }}>
              <b style={s.arya}>{candidateNameHindi}</b>{' '}सुपुत्र/सुपुत्री{' '}<b style={s.arya}>{fatherNameHindi}</b>
            </div>
            <div style={s.inlineDivider} />
            <p style={{ ...s.kokila, fontSize: '12px', margin: '3px 0' }}>
              को {courseYearHindi} के संगोष्ठी में उक्त प्रमाणपत्र प्रदान की गई ।
            </p>
            <div style={{ margin: '2px 0', fontSize: '13px', fontFamily: 'Arial,sans-serif', lineHeight: '1.5' }}>
              This is to certify that having been examined in <b>{courseYearEnglish}</b> and found qualified for the certificate in<br />
              <strong>{courseNameEnglish}</strong><br />
              <strong>{candidateNameEnglish}</strong> d/o/s/o <strong>{fatherNameEnglish}</strong>
              <div style={s.inlineDivider} />
              was awarded the said certificate at the conclave held in {courseYearEnglish}.
            </div>
          </div>

          {/* COURSE DETAILS */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ ...s.centerText, marginBottom: '6px' }}>
              <span style={{ ...s.kokila, fontSize: '15px' }}>पाठ्यक्रम और अंक विवरण</span>
              <span style={{ margin: '0 5px' }}>✱</span>
              <span style={{ ...s.tahoma, fontSize: '12px' }}>Course and Marks Description</span>
            </div>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '2px', alignItems: 'baseline' }}>
                <span style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ ...s.kokila, fontSize: '12px' }}>पाठ्यक्रम की अवधि</span>
                  <span style={{ ...s.tahoma, fontSize: '11px' }}> / Duration of the Course:</span>
                </span>
                <span>
                  <span style={{ ...s.kokila, fontSize: '12px' }}>{durationHindi}</span>
                  <span style={{ ...s.tahoma, fontSize: '11px' }}> / {durationEnglish}</span>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                <span style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ ...s.kokila, fontSize: '12px' }}>शिक्षण विधि</span>
                  <span style={{ ...s.tahoma, fontSize: '11px' }}> / Mode of Teaching:</span>
                </span>
                <span>
                  <span style={{ ...s.kokila, fontSize: '12px' }}>{modeHindi}</span>
                  <span style={{ ...s.tahoma, fontSize: '11px' }}> / {modeEnglish}</span>
                </span>
              </div>
            </div>

            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}><span style={{ ...s.kokila, fontSize: '11px' }}>क्रमांक</span><br /><span style={{ ...s.tahoma, fontSize: '10px' }}>Sr. No.</span></th>
                  <th style={s.th}><span style={{ ...s.kokila, fontSize: '11px' }}>परीक्षा पत्र</span><br /><span style={{ ...s.tahoma, fontSize: '10px' }}>Papers</span></th>
                  <th style={s.th}><span style={{ ...s.kokila, fontSize: '11px' }}>विषय कोड</span><br /><span style={{ ...s.tahoma, fontSize: '10px' }}>Sub. Code</span></th>
                  <th style={s.th}><span style={{ ...s.kokila, fontSize: '11px' }}>पूर्णांक</span><br /><span style={{ ...s.tahoma, fontSize: '10px' }}>Total Marks</span></th>
                  <th style={s.th}><span style={{ ...s.kokila, fontSize: '11px' }}>प्राप्तांक</span><br /><span style={{ ...s.tahoma, fontSize: '10px' }}>Obtained Marks</span></th>
                  <th style={s.th}><span style={{ ...s.kokila, fontSize: '11px' }}>परिणाम का विवरण</span><br /><span style={{ ...s.tahoma, fontSize: '10px' }}>Details of Result</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={s.td}>1.</td>
                  <td style={{ ...s.td, textAlign: 'left', paddingLeft: '6px' }}>
                    <span style={{ ...s.kokila, fontSize: '11px' }}>आंतरिक मूल्यांकन</span><br />
                    <span style={{ ...s.tahoma, fontSize: '10px' }}>Internal Assessment</span>
                  </td>
                  <td style={s.td}>{iaSubCode}</td>
                  <td style={s.td}>{iaMaxMarks}</td>
                  <td style={s.td}>{iaMarks}</td>
                  <td rowSpan={2} style={{ ...s.td, verticalAlign: 'middle' }}>
                    <span style={{ ...s.kokila, fontSize: '11px' }}>{resultRemarkHindi}</span><br />
                    <span style={{ ...s.tahoma, fontSize: '10px' }}>{resultRemarkEnglish}</span>
                  </td>
                </tr>
                <tr>
                  <td style={s.td}>2.</td>
                  <td style={{ ...s.td, textAlign: 'left', paddingLeft: '6px' }}>
                    <span style={{ ...s.kokila, fontSize: '11px' }}>मुख्य परीक्षा</span><br />
                    <span style={{ ...s.tahoma, fontSize: '10px' }}>Main Examination</span>
                  </td>
                  <td style={s.td}>{meSubCode}</td>
                  <td style={s.td}>{meMaxMarks}</td>
                  <td style={s.td}>{meMarks}</td>
                </tr>
                <tr style={{ fontWeight: 'bold' }}>
                  <td colSpan={3} style={s.td}>
                    <span style={{ ...s.kokila, fontSize: '11px' }}>योग:</span><br />
                    <span style={{ ...s.tahoma, fontSize: '10px' }}>Total:</span>
                  </td>
                  <td style={s.td}>{maxMarks}</td>
                  <td style={s.td}>{marksTotal}</td>
                  <td style={s.td}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div style={s.footer}>
            <div style={s.sigBlock}>
              <div style={s.sigImgWrap}>
                <img src="/Signature.png" alt="Signature" style={{ height: '38px', objectFit: 'contain' }} />
              </div>
              <hr style={s.divider} />
              <div style={{ ...s.kokila, fontSize: '14px' }}>परीक्षा नियंत्रक</div>
              <div style={{ ...s.tahoma, fontSize: '11px' }}>Controller of Examination</div>
              <div style={{ ...s.oldEng, fontSize: '8.5px', marginTop: '2px' }}>Varāhamihira Multidisciplinary Institute</div>
            </div>

            <div style={s.dateBlock}>
              <div style={{ ...s.kokila, fontSize: '12px' }}>दिल्ली, दिनांक {dateOfResultHindi}</div>
              <div style={{ ...s.tahoma, fontSize: '11px' }}>Delhi, Dated the {dateOfResultEnglish}</div>
            </div>

            <div style={s.sigBlock}>
              <div style={s.sigImgWrap}>
                <img src="/BKG Signature.png" alt="Verifying Authority" style={{ height: '52px', objectFit: 'contain', marginBottom: '-10px' }} />
              </div>
              <hr style={s.divider} />
              <div style={{ ...s.kokila, fontSize: '14px' }}>सत्यापन प्राधिकारी</div>
              <div style={{ ...s.tahoma, fontSize: '11px' }}>Verifying Authority</div>
              <div style={{ ...s.tahoma, fontSize: '9px', marginTop: '2px', color: '#444', whiteSpace: 'nowrap' }}>Asiatic Society for Social Science Research</div>
            </div>
          </div>

          {certificateNo && (
            <div style={{ fontSize: '8.5px', color: '#aaa', textAlign: 'center', marginTop: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              Certificate No. {certificateNo}
            </div>
          )}
          <div style={{ fontSize: '7.5px', color: '#666', textAlign: 'center', marginTop: '3px', lineHeight: '1.3' }}>
            (यह प्रमाणपत्र डिजिटल रूप से जारी किया गया है और संस्थान के होलोग्राम के बिना इसका प्रिंट अमान्य है / This certificate is digitally issued and printing it is invalid without the Institute hologram.)
          </div>

        </div>
      </div>
    </>
  );
};

export default CertificateTemplate;
