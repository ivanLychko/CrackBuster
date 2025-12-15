import { useState, useEffect } from 'react';

const useSiteSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        } else {
          // Fallback to default values if no settings found
          setSettings({
            phone: '(780) XXX-XXXX',
            email: 'info@crackbuster.ca',
            address: 'Edmonton, Alberta, Canada',
            serviceArea: 'Edmonton and surrounding areas',
            secondaryPhone: '',
            secondaryEmail: '',
            businessHours: '',
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            youtube: '',
            allowIndexing: true
          });
        }
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError(err);
        // Fallback to default values on error
        setSettings({
          phone: '(780) XXX-XXXX',
          email: 'info@crackbuster.ca',
          address: 'Edmonton, Alberta, Canada',
          serviceArea: 'Edmonton and surrounding areas',
          secondaryPhone: '',
          secondaryEmail: '',
          businessHours: '',
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
          youtube: '',
          allowIndexing: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};

export default useSiteSettings;




