import { useEffect } from 'react';
import API from '../api';
import { getImageDisplayUrl } from '../config/urls';

const DynamicFavicon = () => {
    useEffect(() => {
        const updateFavicon = async () => {
            try {
                const { data } = await API.get('/api/settings/general');
                if (data?.value?.favicon) {
                    const faviconUrl = getImageDisplayUrl(data.value.favicon);
                    let link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.getElementsByTagName('head')[0].appendChild(link);
                    }
                    link.href = faviconUrl;
                }
                
                if (data?.value?.siteName) {
                    document.title = data.value.siteName;
                }
            } catch (error) {
                console.error('Error updating dynamic favicon', error);
            }
        };

        updateFavicon();
    }, []);

    return null;
};

export default DynamicFavicon;
