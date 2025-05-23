import React from 'react';

// Static NDA content for preview only
const ndaContent = `NON-DISCLOSURE AGREEMENT

THIS AGREEMENT is made on the __nd of _____, 2024

BETWEEN:
Lulu Money (Singapore) Pte Ltd a company incorporated under the laws of ____________________ ("Party A", including its successors and permitted assigns) and
____________________________________ ("Party B", including its successors and permitted assigns)

(each a "Party" and together referred to as the "Parties")

RECITAL:
Each Party has agreed to disclose to the other Party without charge certain confidential information in connection with the proposed transaction between Party B and Party A (the "Purpose").

NOW IT IS HEREBY AGREED as follows:

1. DEFINITIONS
The following expressions shall, unless the context otherwise admits, have the following meanings:

"Confidential Information" means all non-public, proprietary information disclosed by one Party to the other Party, whether orally, in writing or by any other means, including but not limited to business and marketing plans, product designs, financial data, customer lists, software, trade secrets, and any analyses or compilations thereof prepared by the receiving Party.

"Purpose" means the evaluation of a potential business relationship or transaction between the Parties.

2. TERM
This Agreement covers the disclosure of all Confidential Information for a period of one (1) year from the date of disclosure of such information.

3. OBLIGATIONS OF RECEIVING PARTY
The receiving Party shall:
  a. Hold all Confidential Information in strict confidence;
  b. Not disclose Confidential Information to any third party without the prior written consent of the disclosing Party;
  c. Not use Confidential Information for any purpose other than the Purpose;
  d. Take all reasonable measures to protect the confidentiality and prevent unauthorized use or disclosure of the Confidential Information.

4. EXCLUSIONS FROM CONFIDENTIAL INFORMATION
Confidential Information does not include information which:
  a. Is or becomes publicly known through no breach of this Agreement by the receiving Party;
  b. Is rightfully received by the receiving Party from a third party without restriction on disclosure;
  c. Is independently developed by the receiving Party without the use of Confidential Information;
  d. Is required to be disclosed by applicable law, regulation or court order, provided that the receiving Party gives prompt written notice to the disclosing Party and cooperates in any efforts to limit the disclosure.

5. RETURN OR DESTRUCTION OF MATERIALS
Upon the expiration or termination of this Agreement, the receiving Party shall promptly return or destroy all documents and materials containing Confidential Information and any copies thereof, at the disclosing Party's option.

6. NO LICENSE
Nothing in this Agreement grants the receiving Party any rights in or to the Confidential Information except as expressly set forth herein.

7. NO WARRANTY
All Confidential Information is provided "AS IS". Neither Party makes any warranties regarding the accuracy or completeness of the Confidential Information.

8. GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws of ____________________. The Parties submit to the exclusive jurisdiction of the courts of ____________________.

9. THIRD PARTY RIGHTS
No person other than the Parties, their successors and permitted assigns shall have any right to enforce any term of this Agreement.

10. SEVERABILITY
If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.

IN WITNESS WHEREOF, the Parties hereto have executed this Agreement as of the date first written above.

Party A: Lulu Money (Singapore) Pte Ltd     Party B: ___________________________

Signed By: ____________________________   Signed By: ____________________________
Name: Mr. Joseph Cleetus                      Name: _______________________________
Title: Director                               Title: _______________________________
`; 

interface NDADownloadProps {
  onDownload?: () => void;
}

const NDADownload: React.FC<NDADownloadProps> = ({ onDownload }) => {
  const paragraphs = ndaContent.split('\n').filter(line => line.trim());
  
  const handleDownload = () => {
    // This function just notifies the parent component
    // that the NDA download has been initiated
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div className="p-4 space-y-4 bg-dark rounded-lg shadow-lg text-white border border-white/10 max-h-[60vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-center mb-4">Non-Disclosure Agreement</h2>
      {paragraphs.map((para, idx) => (
        <p key={idx} className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
          {para}
        </p>
      ))}
      <div className="flex justify-center mt-6 space-x-4">
        <a
          href="/WorldAPI_NDA.docx"
          download
          onClick={handleDownload}
          className="px-6 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download NDA (DOCX)</span>
        </a>
      </div>
      <p className="text-xs text-center text-white/50 mt-2">
        Download the document, fill it in, sign it, and re-upload when complete.
      </p>
    </div>
  );
};

export default NDADownload; 