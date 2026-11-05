// Standalone client entry used only for the single-file preview build.
import { createRoot } from 'react-dom/client';
import Experience from '@/components/Experience';
import '@/app/globals.css';
createRoot(document.getElementById('root')!).render(<Experience />);
