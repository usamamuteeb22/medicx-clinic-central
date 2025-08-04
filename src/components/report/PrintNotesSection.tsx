
import React from 'react';

const PrintNotesSection: React.FC = () => {
  return (
    <div className="hidden print:block print-notes-section">
      <h3>Notes</h3>
      <div className="notes-blank-area"></div>
    </div>
  );
};

export default PrintNotesSection;
