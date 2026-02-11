import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import '../AdminWebsiteCSS/Header.css';

const Header = ({ title, subtitle, onToggleCollapse, sidebarCollapsed }) => {
  const [hoveredCollapseBtn, setHoveredCollapseBtn] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <button
          className={`collapse-button ${hoveredCollapseBtn ? 'collapse-button-hover' : ''}`}
          onClick={onToggleCollapse}
          onMouseEnter={() => setHoveredCollapseBtn(true)}
          onMouseLeave={() => setHoveredCollapseBtn(false)}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu size={24} />
        </button>
        
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default Header;