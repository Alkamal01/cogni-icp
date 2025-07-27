import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
export const Portal = ({ children }) => {
    const [portalContainer, setPortalContainer] = useState(null);
    useEffect(() => {
        // Check if the portal root element exists
        let portalRoot = document.getElementById('portal-root');
        // If it doesn't exist, create it
        if (!portalRoot) {
            portalRoot = document.createElement('div');
            portalRoot.id = 'portal-root';
            portalRoot.style.position = 'fixed';
            portalRoot.style.top = '0';
            portalRoot.style.left = '0';
            portalRoot.style.width = '100%';
            portalRoot.style.height = '100%';
            portalRoot.style.pointerEvents = 'none';
            portalRoot.style.zIndex = '9999';
            document.body.appendChild(portalRoot);
        }
        setPortalContainer(portalRoot);
        // Cleanup function to remove the portal root if needed
        return () => {
            if (portalRoot && portalRoot.childNodes.length === 0) {
                document.body.removeChild(portalRoot);
            }
        };
    }, []);
    // Only render the portal if the container exists
    return portalContainer ? createPortal(children, portalContainer) : null;
};
export default Portal;
