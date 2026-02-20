import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import '../AdminWebsiteCSS/Header.css';
import '../AdminWebsiteCSS/RBAC.css';

const Header = ({ title, subtitle, onToggleCollapse, sidebarCollapsed, accessBadge, roleLabel }) => {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="header-title">{title}</h1>
            {accessBadge}
          </div>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default Header;