import './Header.css';

interface HeaderProps {
  client: string;
  valDescription: string;
  planYearStart: string;
  planYearEnd: string;
}

export const Header: React.FC<HeaderProps> = ({
  client,
  valDescription,
  planYearStart,
  planYearEnd,
}) => {
  return (
    <header className="val-header">
      <div className="header-content">
        <div className="header-info">
          <div className="info-group">
            <label>Client</label>
            <div className="client-name">{client}</div>
          </div>
          <div className="info-group">
            <label>VAL Description</label>
            <div className="val-description">{valDescription}</div>
          </div>
          <div className="info-group">
            <label>Plan Year Dates</label>
            <div className="date-range">
              <input type="date" value={planYearStart} readOnly />
              <span>→</span>
              <input type="date" value={planYearEnd} readOnly />
              <button className="calendar-btn">📅</button>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn">Comments & Tasks</button>
          <button className="action-btn">PDF Attachments</button>
          <button className="action-btn">Edit SAFA</button>
          <button className="action-btn primary">Billing Info</button>
        </div>
      </div>
    </header>
  );
};
