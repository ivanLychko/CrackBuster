import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useServerData } from '../contexts/ServerDataContext';

const getPageFromPath = (pathname) => {
  if (pathname === '/') return 'home';
  if (pathname === '/about-us') return 'about-us';
  if (pathname === '/contact-us') return 'contact-us';
  if (pathname === '/get-estimate') return 'get-estimate';
  if (pathname === '/our-works') return 'our-works';
  if (pathname === '/blog') return 'blog';
  if (pathname.startsWith('/blog/')) return 'blog-post';
  if (pathname.startsWith('/services/')) return 'service-detail';
  if (pathname === '/services') return 'services';
  // For NotFound page, we'll use '404' - but this will only work if NotFound component explicitly sets it
  // For now, return '404' for unknown paths (they will be handled by NotFound component)
  return '404';
};

const useSEO = () => {
  const location = useLocation();
  const serverData = useServerData();
  const page = getPageFromPath(location.pathname);
  
  const clientData = typeof window !== 'undefined' && window.__INITIAL_STATE__;
  const initialSEO = serverData?.seo?.[page] || clientData?.seo?.[page] || null;

  const [seo, setSeo] = useState(initialSEO);
  const [loading, setLoading] = useState(!initialSEO);

  useEffect(() => {
    // If we already have SEO from SSR, skip fetching
    if (initialSEO) {
      setLoading(false);
      return;
    }

    const fetchSEO = async () => {
      try {
        const response = await fetch(`/api/seo/${page}`);
        const data = await response.json();
        if (data.seo) {
          setSeo(data.seo);
        } else {
          setSeo(null);
        }
      } catch (err) {
        console.error('Error fetching SEO:', err);
        setSeo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSEO();
  }, [page, initialSEO]);

  return { seo, loading, page };
};

export default useSEO;

